import Link from "next/link";
import { ModeToggle } from "./mode-toggle-button";
import { LogoutButton } from "./logout-button";

export function MainHeader() {
  return (
    <header className="flex justify-between w-full px-4 py-2 border-b font-sans">
      <Link href="/">
        <h1 className="text-2xl font-bold">ESMIE</h1>
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium">
          Prompts
        </Link>
        <Link href="/collections" className="text-sm font-medium">
          Collections
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
