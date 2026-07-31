import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Copy command was rejected.");
};

/** Copies the canonical public-facing URL for a saved build. */
export const CopyBuildLinkButton = ({
  buildId,
  buildName,
  iconOnly = false,
  onClick,
}: {
  buildId: string;
  buildName: string;
  iconOnly?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  const copyLink = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    try {
      const url = new URL(`/b/${encodeURIComponent(buildId)}`, window.location.origin);
      await copyText(url.toString());
      toast({
        variant: "success",
        title: "Loadout link copied",
        description: `${buildName} is ready to paste.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Could not copy link",
        description: "Copy the URL from your browser's address bar instead.",
      });
    }
  };

  return (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : "outline"}
      size={iconOnly ? "icon" : "default"}
      className={iconOnly ? undefined : "gap-2 uppercase tracking-wider"}
      aria-label={iconOnly ? `Copy link to ${buildName}` : undefined}
      title={iconOnly ? "Copy loadout link" : undefined}
      onClick={(event) => void copyLink(event)}
    >
      <Link2 className="size-4" />
      {!iconOnly && "Copy link"}
    </Button>
  );
};
