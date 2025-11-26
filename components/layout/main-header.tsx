import Link from "next/link";
import { ModeToggle } from "@/components/shared/mode-toggle-button";
import { LogoutButton } from "@/components/auth/logout-button";

export function MainHeader() {
  return (
    <header className="flex justify-between w-full px-4 py-2 border-b font-sans">
      <Link href="/">
        <h1 className="text-2xl font-bold">ESMIE</h1>
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/create" className="text-sm font-medium">
          Create
        </Link>
        <Link href="/" className="text-sm font-medium">
          Prompts
        </Link>
        <Link href="/favorites" className="text-sm font-medium">
          Favorites
        </Link>
        <Link href="/trash" className="text-sm font-medium">
          Trash
        </Link>
        <Link href="/settings" className="text-sm font-medium">
          Settings
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
