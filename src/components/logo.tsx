import { cn } from "cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="EdCar"
      className={cn("size-9 shrink-0", className)}
    >
      <defs>
        <linearGradient id="edcar-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="55%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#edcar-mark)" />
      <path
        d="M12 11H28V15.4H16.4V18.4H24.6V22.2H16.4V24.6H28V29H12V11Z"
        fill="#ffffff"
      />
      <path
        d="M29.6 8.4L31.6 10.4L19.4 22.6L17.4 20.6L29.6 8.4Z"
        fill="#ffffff"
        fillOpacity="0.75"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  variant?: "default" | "sidebar";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  const isSidebar = variant === "sidebar";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-base font-bold tracking-tight",
            isSidebar ? "text-white" : "text-foreground",
          )}
        >
          Ed<span className="text-primary">Car</span>
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.22em]",
            isSidebar ? "text-white/55" : "text-muted-foreground",
          )}
        >
          Estoque
        </span>
      </span>
    </span>
  );
}
