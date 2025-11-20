import { AddNewPrompt } from "@/components/add-new-prompt";
import { PromptCard } from "@/components/prompt-card";
import { createClient } from "@/lib/server";

interface Prompt {
  id: string;
  core_theme: string;
  version: number;
  hair: string;
  pose: string;
  outfit: string;
  atmosphere: string;
  gaze: string;
  makeup: string;
  background: string;
  final_prompt: string;
  aspect_ratio: string;
  created_at?: string;
}

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching prompts:", error);
  }

  return (
    <div className="flex flex-col flex-1 p-2 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <AddNewPrompt />
        </div>
      </div>
      {error ? (
        <div className="text-red-500 p-4">
          프롬프트를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      ) : prompts && prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {prompts.map((prompt: Prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-8">
          프롬프트가 없습니다. 새 프롬프트를 추가해보세요.
        </div>
      )}
    </div>
  );
}
