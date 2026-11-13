import React from "react";
import Link from "next/link";
import { brandConfig } from "@/config/brand.config";

interface LogoProps {
  variant?: "main" | "compact" | "icon" | "white";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "main",
  className = "",
  size = "md",
  withLink = true,
}) => {
  const sizeClasses = {
    sm: variant === "icon" ? "w-8 h-8" : "h-7 w-auto",
    md: variant === "icon" ? "w-10 h-10" : "h-9 w-auto",
    lg: variant === "icon" ? "w-14 h-14" : "h-12 w-auto",
    xl: variant === "icon" ? "w-20 h-20" : "h-16 w-auto",
  };

  const getLogoSrc = () => {
    switch (variant) {
      case "compact":
        return brandConfig.logos.compact;
      case "icon":
        return brandConfig.logos.appIcon;
      case "white":
        return brandConfig.logos.white;
      case "main":
      default:
        return brandConfig.logos.main;
    }
  };

  const content = (
    <div className={`inline-flex items-center gap-2 select-none transition-transform hover:scale-102 active:scale-98 ${className}`}>
      <img
        src={getLogoSrc()}
        alt={brandConfig.name}
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" aria-label={`${brandConfig.name} Home`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-proz-cyan/50 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
