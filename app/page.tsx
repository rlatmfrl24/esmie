import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Dashboard from "./dashboard";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-svh w-full flex-col font-sans">
      <div className="flex w-full flex-1">
        <main className="flex flex-col flex-1">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
