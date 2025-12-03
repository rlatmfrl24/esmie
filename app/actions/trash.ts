"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

const stripTrashMetadata = <T extends Record<string, unknown>>(item: T) => {
  const clone = { ...item } as Record<string, unknown>;
  delete clone.id;
  delete clone.deleted_at;
  delete clone.is_favorite;
  delete clone.prompt_id;
  delete clone.favorite_id;
  delete clone.favorite_status;
  delete clone.favorite_snapshot_created_at;
  return clone as Omit<
    T,
    | "id"
    | "deleted_at"
    | "is_favorite"
    | "prompt_id"
    | "favorite_id"
    | "favorite_status"
    | "favorite_snapshot_created_at"
  >;
};

export async function restorePrompt(id: string) {
  const supabase = await createClient();

  try {
    // 1. Fetch from trash
    const { data: trashItem, error: fetchError } = await supabase
      .from("trash")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !trashItem) {
      throw new Error(`Failed to fetch from trash: ${fetchError?.message}`);
    }

    // 2. Insert back into appropriate table based on origin_type
    // Note: trash table has bigint id, but target tables use UUID id
    // Exclude trash-specific fields and id (target tables will auto-generate UUID id)
    const { origin_type, item_uid, ...trashRest } = trashItem;
    const promptData = stripTrashMetadata(trashRest);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (origin_type === "FAVORITE") {
      // Restore to favorite_prompts
      // Exclude id (favorite_prompts will auto-generate UUID id)
      const { error: insertError } = await supabase
        .from("favorite_prompts")
        .insert([
          {
            ...promptData,
            user_id: user.id,
            item_uid: null,
          },
        ]);

      if (insertError) {
        throw new Error(`Failed to restore favorite: ${insertError.message}`);
      }
    } else {
      // Restore to prompts (default for PROMPT or undefined)
      const restoredPrompt = {
        ...promptData,
        id: item_uid || promptData.id,
      };
      const { error: insertError } = await supabase
        .from("prompts")
        .insert([restoredPrompt]);

      if (insertError) {
        throw new Error(`Failed to restore prompt: ${insertError.message}`);
      }
    }

    // 3. Delete from trash
    const { error: deleteError } = await supabase
      .from("trash")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to remove from trash: ${deleteError.message}`);
    }

    revalidatePath("/trash");
    revalidatePath("/");
    revalidatePath("/favorites");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error restoring prompt:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류입니다.",
    };
  }
}

export async function deleteTrashPrompt(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("trash").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete permanently: ${error.message}`);
    }

    revalidatePath("/trash");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting trash prompt:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류입니다.",
    };
  }
}
