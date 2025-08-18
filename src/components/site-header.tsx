import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
             <Image 
                src="/logo2.avif"
                alt="VMKVEC Logo"
                width={50}
                height={50}
                className="rounded-full"
             />
            <span className="inline-block font-bold font-headline text-xl tracking-tighter">
              Code Crucible
            </span>
          </Link>
        </div>
        <div className="flex items-center">
            <Image 
                src="/logo1.webp"
                alt="Vinayaka Missions Logo"
                width={120}
                height={50}
            />
        </div>
      </div>
    </header>
  );
}
