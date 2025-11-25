import { createClient } from "@/lib/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MergeClient } from "./merge-client";

export default async function MergePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = idsParam?.split(",") || [];

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <p className="text-muted-foreground mb-4">
          선택된 프롬프트가 없습니다.
        </p>
        <Link href="/">
          <Button>돌아가기</Button>
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("*")
    .in("id", ids);

  if (error || !prompts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="text-red-500 mb-4">
          Error loading prompts: {error?.message || "Unknown error"}
        </div>
        <Link href="/">
          <Button>돌아가기</Button>
        </Link>
      </div>
    );
  }

  const mergedText = prompts
    .map((p) => p.final_prompt || "")
    .filter((text) => text.trim() !== "")
    .join("\n-------------\n");

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Merged Prompts ({prompts.length})</CardTitle>
          <MergeClient text={mergedText} />
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg border font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {mergedText}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
