//src/subgraphs/listing/domain/value-objects/Title.ts

export class Title {
  private value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value.trim();
  }

  getValue() {
    return this.value;
  }

  private validate(value: string) {
    if (!value || value.trim().length < 5) {
      throw new Error("Title must be at least 5 characters");
    }
  }

  // 🔥 AI 能力内聚
  buildAIPrompt(context: { description: string }) {
    return `
You are an expert real estate copywriter.

Rewrite the title to be more attractive and SEO-friendly.

Current title:
"${this.value}"

Description:
"${context.description}"

Return ONLY the improved title.
`;
  }
}