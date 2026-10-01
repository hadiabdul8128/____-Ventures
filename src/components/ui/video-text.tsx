import React, {
  useState,
  type ElementType,
  type ReactNode,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

export interface VideoTextProps {
  /**
   * The video source URL
   */
  src: string;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Whether to autoplay the video
   */
  autoPlay?: boolean;
  /**
   * Whether to mute the video
   */
  muted?: boolean;
  /**
   * Whether to loop the video
   */
  loop?: boolean;
  /**
   * Whether to preload the video
   */
  preload?: "auto" | "metadata" | "none";
  /**
   * The content to display (will have the video "inside" it)
   */
  children: ReactNode;
  /**
   * Font size for the text mask (in viewport width units)
   * @default 10
   */
  fontSize?: string | number;
  /**
   * Font weight for the text mask
   * @default "bold"
   */
  fontWeight?: string | number;
  /**
   * Text anchor for the text mask
   * @default "middle"
   */
  textAnchor?: string;
  /**
   * Dominant baseline for the text mask
   * @default "middle"
   */
  dominantBaseline?: string;
  /**
   * Font family for the text mask
   * @default "sans-serif"
   */
  fontFamily?: string;
  /**
   * The element type to render for the text
   * @default "div"
   */
  as?: ElementType;
}

// Adapted from Magic UI: a CSS blend mask lets locally hosted fonts render
// correctly. Standalone SVG image masks cannot inherit document web fonts.
export function VideoText({
  src,
  children,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  preload = "auto",
  fontSize = 20,
  fontWeight = "bold",
  textAnchor = "middle",
  dominantBaseline = "middle",
  fontFamily = "sans-serif",
  as: Component = "div",
}: VideoTextProps) {
  const [ready, setReady] = useState(false);
  const content = React.Children.toArray(children).join("");
  const typeStyle: CSSProperties = {
    fontSize: typeof fontSize === "number" ? `${fontSize}vw` : fontSize,
    fontWeight,
    fontFamily,
    lineHeight: 1,
    letterSpacing: 0,
    justifyContent:
      textAnchor === "start"
        ? "flex-start"
        : textAnchor === "end"
          ? "flex-end"
          : "center",
    alignItems: dominantBaseline === "hanging" ? "flex-start" : "center",
  };
  return (
    <Component className={cn("relative isolate size-full", className)}>
      <span className="absolute inset-0 flex text-[#cfb679]" style={typeStyle}>
        {content}
      </span>
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload={preload}
          playsInline
          onCanPlay={() => setReady(true)}
          onError={() => setReady(false)}
        >
          <source src={src} />
        </video>
        <div
          className="absolute inset-0 flex bg-black text-white"
          style={{ ...typeStyle, mixBlendMode: "multiply" }}
        >
          {content}
        </div>
      </div>
    </Component>
  );
}
