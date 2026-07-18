import { lazy, ComponentType, LazyExoticComponent } from "react";

export const TOOL_REGISTRY: Record<string, LazyExoticComponent<ComponentType>> = {
  "word-counter": lazy(() => import("./word-counter")),
  "case-converter": lazy(() => import("./case-converter")),
  "lorem-ipsum": lazy(() => import("./lorem-ipsum")),
  "text-to-speech": lazy(() => import("./text-to-speech")),
  "image-resizer": lazy(() => import("./image-resizer")),
  "image-compressor": lazy(() => import("./image-compressor")),
  "image-to-pdf": lazy(() => import("./image-to-pdf")),
};