# Rich Content & SEO Overhaul Plan

This plan implements a comprehensive content upgrade for all 350+ tools on Nexatools. The goal is to provide high-quality, unique, and tool-specific content (800+ words per page) to satisfy AdSense guidelines and maximize SEO performance.

## User Interface & Presentation
- **Tool Shell Update**: Modify `src/components/tool-shell.tsx` to accommodate the new rich content structure:
    - **Use Cases Section**: A dedicated grid section for real-world scenarios.
    - **How-to Section**: Enhanced numbered steps with clearer visibility.
    - **About Section**: Expanded with Key Features, How it works, and Why this tool matters.
    - **Related Tools**: Improved linking strategy at the bottom.
- **Dynamic Meta Tags**: Ensure `src/routes/tools.$slug.tsx` uses the new `metaDescription` field.

## Technical Details
- **Data Structure Expansion**:
    - Update the `ToolContent` type in `src/lib/tool-content.ts` to include:
        - `metaDescription: string`
        - `useCases: string[]`
        - `relatedTools: string[]` (slugs)
- **Content Generation System**:
    - Overhaul `getToolContent` to generate rich text dynamically based on tool properties (category, name, description) while ensuring 60%+ uniqueness via template weaving and category-specific fragments.
    - Prioritize specific overrides for the top 10 tools requested: `13th-month-pay-calculator`, `pdf-compressor`, `case-converter`, `image-compressor`, `pdf-merge`, `json-formatter`, `utm-builder`, `position-size-calculator`, `word-counter`, and `password-generator`.
- **SEO & Schema**:
    - The existing `SoftwareApplication`, `FAQPage`, and `HowTo` JSON-LD schemas in `src/routes/tools.$slug.tsx` will automatically ingest the new, richer data.
- **Internal Linking**:
    - Implement logic in `ToolShell` to pull specific `relatedTools` if defined, falling back to category-based siblings.

## Implementation Steps

### Phase 1: Core Architecture (Parallel)
1. Update types in `src/lib/tool-content.ts`.
2. Update `ToolShell.tsx` UI components to render new sections.
3. Update `toolMetaDescription` in `src/lib/tool-content.ts` to prioritize the new field.

### Phase 2: Priority Content Implementation
1. Add detailed, unique `OVERRIDES` for the top 10 tools in `src/lib/tool-content.ts`.
2. Verify visual rendering and word counts on these pages.

### Phase 3: Global Content Scaling
1. Enhance the default generators (`defaultLongDescription`, `defaultHowToUse`, `defaultFaqs`) in `src/lib/tool-content.ts` to be significantly more robust and unique.
2. Add more category-specific fragments to `CATEGORY_COPY` to ensure cross-category uniqueness.
3. Batch update `registry.ts` or `tools-data.ts` if specific metadata adjustments are needed for the 350+ tools.

### Phase 4: Verification
1. Audit random pages to ensure content exceeds 800 words where possible (or meets the high-quality threshold).
2. Check `sitemap.xml` and head metadata.
