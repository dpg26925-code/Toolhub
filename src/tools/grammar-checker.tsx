import { WritingTool } from "./_writing-ui";
export default function GrammarCheckerTool() {
  return (
    <WritingTool
      mode="grammar-check"
      toolSlug="grammar-checker"
      placeholder="Paste text to check grammar, spelling and punctuation…"
      buttonLabel="Check grammar"
    />
  );
}