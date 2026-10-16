import { Skeleton } from "@/components/ui/skeleton";

export function EstoqueSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full gap-2 sm:flex-row">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          <Skeleton className="h-9 w-full sm:w-36" />
          <Skeleton className="h-9 w-full sm:w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <div className="border-b bg-muted/40 px-4 py-3">
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}