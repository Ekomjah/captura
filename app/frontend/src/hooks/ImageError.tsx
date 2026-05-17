import React from "react";

export function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.src = "@/assets/placeholder.svg";
    target.onerror = null; // Prevent infinite loop
  };

  return (
    <img src={src} onError={handleError} alt={alt} className={className} />
  );
}
