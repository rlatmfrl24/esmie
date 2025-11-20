import Link from "next/link";
import { ModeToggle } from "./mode-toggle-button";
import { LogoutButton } from "./logout-button";

export function MainHeader() {
  return (
    <header className="flex justify-between w-full p-2 border-b">
      <Link href="/">
        <h1 className="text-2xl font-bold">ESMIE</h1>
      </Link>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
