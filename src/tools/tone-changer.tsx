import { WritingTool } from "./_writing-ui";
export default function ToneChangerTool() {
  return (
    <WritingTool
      mode="tone"
      toolSlug="tone-changer"
      placeholder="Paste text you want to rewrite in a different tone…"
      buttonLabel="Change tone"
      optionLabel="New tone"
      optionValues={["friendly", "formal", "witty", "empathetic", "confident", "casual", "professional"]}
    />
  );
}