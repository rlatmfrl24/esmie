import { createClient } from "@/lib/server";
import { FavoritesList } from "./favorites-list";
import { redirect } from "next/navigation";
import { Prompt } from "@/lib/types";

interface FavoritePrompt extends Prompt {
  prompt_id: string;
}

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: favorites, error } = await supabase
    .from("favorite_prompts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return (
      <div className="flex flex-col flex-1 p-4 space-y-4">
        <h1 className="text-2xl font-bold">Favorite Prompts</h1>
        <div className="text-red-500">
          즐겨찾기를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      </div>
    );
  }

  return (
    <FavoritesList
      initialPrompts={(favorites as unknown as FavoritePrompt[]) || []}
    />
  );
}
