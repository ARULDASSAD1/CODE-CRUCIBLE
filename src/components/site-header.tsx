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
        
        <div className="hidden md:flex flex-1 justify-center">
              <h2 className="font-headline text-xl md:text-2xl font-bold tracking-tight text-center">
                Department of CSE - Colloquiums - 2k25
            </h2>
        </div>

        <div className="flex items-center">
           <Image 
                src="/logo1-modified.png"
                alt="Vinayaka Missions Logo"
                width={160}
                height={90}
                style={{ height: 'auto' }}
            />
        </div>
      </div>
    </header>
  );
}
