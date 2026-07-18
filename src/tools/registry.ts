import { lazy, ComponentType, LazyExoticComponent } from "react";

export const TOOL_REGISTRY: Record<string, LazyExoticComponent<ComponentType>> = {
  "word-counter": lazy(() => import("./word-counter")),
  "case-converter": lazy(() => import("./case-converter")),
  "lorem-ipsum": lazy(() => import("./lorem-ipsum")),
  "text-to-speech": lazy(() => import("./text-to-speech")),
  "image-resizer": lazy(() => import("./image-resizer")),
  "image-compressor": lazy(() => import("./image-compressor")),
  "image-to-pdf": lazy(() => import("./image-to-pdf")),
  "pdf-merge": lazy(() => import("./pdf-merge")),
  "pdf-split": lazy(() => import("./pdf-split")),
  "pdf-compressor": lazy(() => import("./pdf-compressor")),
  "pdf-to-word": lazy(() => import("./pdf-to-word")),
  "ocr": lazy(() => import("./ocr")),
  "remove-background": lazy(() => import("./remove-background")),
  "summarize": lazy(() => import("./summarize")),
  "translate": lazy(() => import("./translate")),
  "rewrite": lazy(() => import("./rewrite")),
  "chat-pdf": lazy(() => import("./chat-pdf")),
};