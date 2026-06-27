import { cn } from "@/lib/utils";

/**
 * Renders a guest name with automatic bidi isolation.
 *
 * Guest names are Hebrew (RTL) but the surrounding UI is English (LTR). `<bdi>`
 * with `dir="auto"` lets the browser detect each name's direction and prevents
 * it from leaking into / being reordered by the surrounding text.
 */
export function Name({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <bdi dir="auto" className={cn("inline-block", className)}>
      {children}
    </bdi>
  );
}
