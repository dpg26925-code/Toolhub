import { WritingTool } from "./_writing-ui";
export default function ParagraphGeneratorTool() {
  return (
    <WritingTool
      mode="paragraph"
      toolSlug="paragraph-generator"
      placeholder="Enter a topic or a few keywords, e.g. 'Benefits of remote work for creative teams'"
      buttonLabel="Generate paragraph"
      optionLabel="Tone"
      optionValues={["neutral", "friendly", "formal", "persuasive", "academic"]}
    />
  );
}