import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen font-sans">
      <main>
        <h1>Hello World</h1>
      </main>
    </div>
  );
}
