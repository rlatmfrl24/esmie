import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle-button";
import Dashboard from "./dashboard";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-svh w-full flex-col font-sans">
      <header className="flex justify-between w-full p-2 border-b">
        <Link href="/">
          <h1 className="text-2xl font-bold">ESMIE</h1>
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <LogoutButton />
        </div>
      </header>
      <div className="flex w-full flex-1">
        <main className="flex flex-col flex-1">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
