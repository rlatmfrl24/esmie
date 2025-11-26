import { createClient } from "@/lib/server";
import { Prompt } from "@/lib/types";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackSheet } from "@/components/shared/feedback-sheet";
import { Calendar, Sparkles } from "lucide-react";
import { VersionSelector } from "@/components/prompts/version-selector";
import { DuplicatePromptButton } from "@/components/prompts/duplicate-prompt-button";
import { AddToFavoriteButton } from "@/components/prompts/add-to-favorite-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { EditPromptSheet } from "@/components/prompts/edit-prompt-sheet";
import { RollbackButton } from "@/components/prompts/rollback-button";

export default async function PromptDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ version?: string }>;
}) {
  const { id } = await params;
  const { version: versionParam } = await searchParams;
  const supabase = await createClient();

  const { data: prompt, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !prompt) {
    console.error("Error fetching prompt:", error);
    notFound();
  }

  // Fetch history versions
  const { data: histories } = await supabase
    .from("prompt_histories")
    .select("version, created_at")
    .eq("prompt_id", id)
    .order("version", { ascending: false });

  const allVersions = [
    {
      version: prompt.version,
      created_at: prompt.created_at || new Date().toISOString(),
      isCurrent: true,
    },
    ...(histories || []).map((h) => ({
      version: h.version,
      created_at: h.created_at,
      isCurrent: false,
    })),
  ].sort((a, b) => b.version - a.version);

  let p = prompt as Prompt;
  let isViewingHistory = false;

  if (versionParam) {
    const requestedVersion = parseInt(versionParam);
    if (!isNaN(requestedVersion) && requestedVersion !== prompt.version) {
      const { data: historyPrompt } = await supabase
        .from("prompt_histories")
        .select("*")
        .eq("prompt_id", id)
        .eq("version", requestedVersion)
        .single();

      if (historyPrompt) {
        p = {
          ...historyPrompt,
          id: id,
        } as Prompt;
        isViewingHistory = true;
      }
    }
  }

  return (
    <div className="container p-4 space-y-8 mx-auto font-sans">
      <div className="grid gap-6">
        <div className="flex items-start justify-between">
          <div>
            <BackButton />

            <h1 className="text-3xl font-bold tracking-tight">
              {p.core_theme || "Untitled Theme"}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <VersionSelector
                  promptId={id}
                  currentVersion={p.version}
                  versions={allVersions}
                />
              </div>
              {p.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isViewingHistory && <EditPromptSheet prompt={p} />}
            {!isViewingHistory && <DuplicatePromptButton prompt={p} />}
            <AddToFavoriteButton prompt={p} />
            {!isViewingHistory && <FeedbackSheet prompt={p} />}
            {isViewingHistory && (
              <>
                <Button disabled variant="outline">
                  Past Version (Read Only)
                </Button>
                <RollbackButton prompt={p} promptId={id} />
              </>
            )}
          </div>
        </div>

        {isViewingHistory && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Viewing Past Version</AlertTitle>
            <AlertDescription>
              You are viewing version {p.version}. This is a historical
              snapshot.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Final Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-6 rounded-lg border border-border">
              <p className="whitespace-pre-wrap leading-relaxed text-lg">
                {p.final_prompt}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard title="Character Details">
            <DetailRow label="Hair" value={p.hair} />
            <DetailRow label="Pose" value={p.pose} />
            <DetailRow label="Outfit" value={p.outfit} />
            <DetailRow label="Gaze" value={p.gaze} />
            <DetailRow label="Makeup" value={p.makeup} />
            <DetailRow label="Details" value={p.details} />
          </DetailCard>

          <DetailCard title="Environment & Technical">
            <DetailRow label="Atmosphere" value={p.atmosphere} />
            <DetailRow label="Background" value={p.background} />
            <DetailRow label="Aspect Ratio" value={p.aspect_ratio} />
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-4 pb-2 border-b last:border-0 last:pb-0">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="col-span-2 font-medium">{value}</span>
    </div>
  );
}
