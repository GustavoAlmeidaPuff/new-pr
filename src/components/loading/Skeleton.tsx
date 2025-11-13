type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-background-muted/60";

  return <div className={`${baseClasses} ${className}`.trim()} />;
}


