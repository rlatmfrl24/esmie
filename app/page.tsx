import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Prompts from "./prompts";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex w-full flex-col font-sans">
      <Prompts />
    </div>
  );
}
