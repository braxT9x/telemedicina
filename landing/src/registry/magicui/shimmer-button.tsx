import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "2px",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/15 px-6 py-3 text-white [border-radius:var(--radius)]",
          "transform-gpu transition-all duration-300 ease-in-out active:translate-y-px",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container (Magic UI border glow beam) */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 h-full w-full overflow-visible [container-type:size]",
          )}
          aria-hidden="true"
        >
          <div className="animate-shimmer-slide absolute inset-0 h-[100cqh] aspect-square rounded-none [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* Surface shimmer sweep across the button */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [border-radius:var(--radius)]"
          aria-hidden="true"
        >
          <div
            className="animate-shimmer-sweep absolute inset-y-0 w-3/4 opacity-35"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2.5">
          {children}
        </div>

        {/* Highlight inner glow */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 size-full",
            "[border-radius:var(--radius)] px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",
          )}
          aria-hidden="true"
        />

        {/* Backdrop (solid background color inset to reveal the perimeter spark) */}
        <div
          className={cn(
            "pointer-events-none absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
          aria-hidden="true"
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
