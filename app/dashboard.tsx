import { PromptList } from "@/components/prompt-list";
import { createClient } from "@/lib/server";
import { Prompt } from "@/lib/types";

export default async function Dashboard() {
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

  return <PromptList prompts={(prompts as Prompt[]) || []} />;
}
