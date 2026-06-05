import React from "react";
import placeholderImg from "@/assets/placeholder.svg";

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
    // Importing the asset lets Vite resolve it to a real hashed URL. The bare
    // "@/assets/..." alias is only valid in import statements, not as a runtime
    // src — used directly it 404s and shows a broken image instead of the
    // fallback.
    target.onerror = null; // prevent a loop if the placeholder itself fails
    target.src = placeholderImg;
  };

  return (
    <img
      src={src || placeholderImg}
      onError={handleError}
      alt={alt}
      className={className}
    />
  );
}
