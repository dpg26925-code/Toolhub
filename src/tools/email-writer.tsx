import { WritingTool } from "./_writing-ui";
export default function EmailWriterTool() {
  return (
    <WritingTool
      mode="email"
      toolSlug="email-writer"
      placeholder="Brief for your email, e.g. 'Ask my manager for time off next Friday for a medical appointment'"
      buttonLabel="Draft email"
      optionLabel="Tone"
      optionValues={["professional", "friendly", "formal", "concise", "persuasive"]}
    />
  );
}