import { WritingTool } from "./_writing-ui";
export default function ContentExpanderTool() {
  return (
    <WritingTool
      mode="expand"
      toolSlug="content-expander"
      placeholder="Paste short notes, bullet points or a rough outline to expand…"
      buttonLabel="Expand content"
      optionLabel="Target length"
      optionValues={["short (1 paragraph)", "medium (2-3 paragraphs)", "long (4+ paragraphs)"]}
      defaultOption="medium (2-3 paragraphs)"
    />
  );
}