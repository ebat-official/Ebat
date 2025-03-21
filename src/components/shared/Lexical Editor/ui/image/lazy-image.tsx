import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CSSProperties, JSX, useEffect, useState } from "react";

const imageCache = new Set();

export default function LazyImage({
  altText,
  style,
  imageRef,
  src,
  onError,
}: {
  altText: string;
  style?: CSSProperties;
  imageRef: { current: null | HTMLImageElement };
  src: string;
  onError: () => void;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageCache.has(src)) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => {
      imageCache.add(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      imageCache.add(src);
      setIsLoading(false);
      onError();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);

 
  
  return (
    <>
      {isLoading && (
        <Skeleton
          style={style}
        />
      )}
      <img
        className={cn("max-w-full transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
        src={src}
        alt={altText}
        ref={imageRef}
        style={style}
        onError={onError}
        draggable="false"
      />
    </>
  );
}
