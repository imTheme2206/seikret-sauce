import { Separator } from "@/components/ui/separator";
import { BrandStar } from "../icons";

/** Top application bar: brand mark + page title. Purely presentational. */
export function AppHeader() {
  return (
    <header className="flex h-[50px] shrink-0 items-center gap-2.5 border-b border-border bg-[hsl(24,14%,7%)] px-5">
      <BrandStar size={20} className="text-primary" />
      <span className="font-serif text-sm font-bold tracking-[0.12em] text-primary">
        MH WILDS
      </span>
      <Separator orientation="vertical" className="h-4 shrink-0" />
      <span className="font-serif text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
        LOADOUT OPTIMIZER
      </span>
    </header>
  );
}
