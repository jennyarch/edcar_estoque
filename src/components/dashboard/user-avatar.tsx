import { cn } from "cn";

interface UserAvatarProps {
  nome: string;
  url: string | null;
  className?: string;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).slice(0, 2);
  return partes.map((parte) => parte.charAt(0)).join("").toUpperCase() || "?";
}

export function UserAvatar({ nome, url, className }: UserAvatarProps) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        className={cn(
          "size-8 shrink-0 rounded-full object-cover ring-1 ring-border",
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary ring-1 ring-primary/20",
        className,
      )}
    >
      {iniciais(nome)}
    </span>
  );
}
