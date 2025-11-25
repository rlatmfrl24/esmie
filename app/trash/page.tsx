import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { TrashTable } from "@/components/prompts/trash-table";

export default async function TrashPage() {
  const supabase = await createClient();

  const { data: userData, error: authError } = await supabase.auth.getClaims();
  if (authError || !userData?.claims) {
    redirect("/auth/login");
  }

  const { data: trashData, error: fetchError } = await supabase
    .from("trash")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error fetching trash:", fetchError);
    return <div>Error loading trash items.</div>;
  }

  return (
    <div className="flex w-full flex-col font-sans h-full">
      <TrashTable data={trashData || []} />
    </div>
  );
}
