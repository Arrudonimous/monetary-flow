import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-forest text-paper-raised hover:bg-forest-strong disabled:opacity-50",
  secondary:
    "border border-line-strong text-ink hover:bg-paper-sunken disabled:opacity-50",
  danger: "text-oxide hover:text-oxide-strong hover:underline",
  ghost: "text-ink-muted hover:text-ink",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ variant = "primary", className = "", ...props }, ref) {
  const base =
    variant === "danger" || variant === "ghost"
      ? "text-sm font-medium transition-colors disabled:cursor-not-allowed"
      : "rounded-sm px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed";

  return (
    <button
      ref={ref}
      className={`${base} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
});
