import * as React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 32, className = "", showText = true }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width={size}
        height={size}
        role="img"
        aria-labelledby="neemseo-logo"
        className="shrink-0"
      >
        <title id="neemseo-logo">neemSEO</title>
        <g>
          <path d="M33 70 C28 47 48 31 71 33 C73 55 56 74 33 70 Z" fill="#8CC63F" />
          <path
            d="M33 70 L65 39"
            stroke="#0F3D2E"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M44.5 59 L51 65.5 M52.5 50.5 L60 58.5 M44.5 59 L38.5 53.5 M52.5 50.5 L46 44"
            stroke="#0F3D2E"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <circle cx="52" cy="52" r="36" fill="none" stroke="#0F3D2E" strokeWidth="10" />
          <line
            x1="79"
            y1="79"
            x2="106"
            y2="106"
            stroke="#0F3D2E"
            strokeWidth="13"
            strokeLinecap="round"
          />
        </g>
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-[-0.04em] text-[#0F3D2E]">
          neem<span className="text-[#8CC63F]">SEO</span>
        </span>
      )}
    </div>
  );
}
