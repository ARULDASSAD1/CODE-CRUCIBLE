import { Icons } from "@/components/icons";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-7 w-7 text-primary" />
            <span className="inline-block font-bold font-headline text-xl tracking-tighter">
              Code Crucible
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
