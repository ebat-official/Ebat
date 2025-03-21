import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CSSProperties, JSX, useEffect, useState } from "react";

const videoCache = new Set<string>();

export default function LazyVideo({
  videoRef,
  src,
  style,
  onError,
  rounded,
  controls = true,
}: {
  style?: CSSProperties;
  videoRef: { current: null | HTMLVideoElement };
  src: string;
  onError: () => void;
  rounded: number;
  controls?: boolean;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoCache.has(src)) {
      setIsLoading(false);
      return;
    }

    // Create a video element to check if it can load the source
    const video = document.createElement("video");
    video.src = src;

    // When the video has loaded enough data to be playable, mark it as loaded
    video.onloadeddata = () => {
      videoCache.add(src);
      setIsLoading(false);
    };

    video.onerror = () => {
      videoCache.add(src);
      setIsLoading(false);
      onError();
    };

    return () => {
      video.onloadeddata = null;
      video.onerror = null;
    };
  }, [src, onError]);


  return (
    <>
      {isLoading && (
        <Skeleton
          style={style}
        />
      )}
      <video
        className={cn(" transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
        src={src}
        ref={videoRef}
        style={style}
        onError={onError}
        controls={controls}
        draggable="false"
      />
    </>
  );
}
