import { PromptTable } from "@/components/prompts/prompt-table";
import { createClient } from "@/lib/server";
import { Prompt } from "@/lib/types";

export default async function Prompts() {
  const supabase = await createClient();

  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching prompts:", error);
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 p-4 space-y-4">
        <h1 className="text-2xl font-bold">Prompts</h1>
        <div className="text-red-500 p-4">
          프롬프트를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      </div>
    );
  }

  let promptsWithFavorites = (prompts as Prompt[]) || [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: favorites } = await supabase
      .from("favorite_prompts")
      .select("prompt_id")
      .eq("user_id", user.id);

    const favoriteIds = new Set(favorites?.map((f) => f.prompt_id));

    promptsWithFavorites = promptsWithFavorites.map((p) => ({
      ...p,
      is_favorite: favoriteIds.has(p.id),
    }));
  }

  return <PromptTable data={promptsWithFavorites} />;
}
