import { WritingTool } from "./_writing-ui";
export default function BlogTitleGeneratorTool() {
  return (
    <WritingTool
      mode="blog-titles"
      toolSlug="blog-title-generator"
      placeholder="Enter a topic or keyword, e.g. 'productivity apps for freelancers'"
      buttonLabel="Generate 10 titles"
    />
  );
}