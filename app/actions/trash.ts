"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

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

    // 2. Insert back into prompts
    const {
      deleted_at,
      is_favorite,
      origin_type,
      prompt_id,
      item_uid,
      ...promptData
    } = trashItem;
    const { error: insertError } = await supabase
      .from("prompts")
      .insert([promptData]);

    if (insertError) {
      throw new Error(`Failed to restore prompt: ${insertError.message}`);
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
    return { success: true };
  } catch (error: any) {
    console.error("Error restoring prompt:", error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error("Error deleting trash prompt:", error);
    return { success: false, error: error.message };
  }
}
