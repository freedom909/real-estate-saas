export class Description {
  private value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value.trim();
  }

  getValue() {
    return this.value;
  }

  private validate(value: string) {
    if (!value || value.trim().length < 10) {
      throw new Error("Description too short");
    }
  }

  buildAIPrompt(context: { title: string }) {
    return `
You are an expert Airbnb listing writer.

Improve the following description:

Title:
"${context.title}"

Description:
"${this.value}"

Make it more engaging, emotional, and clear.

Return ONLY the improved description.
`;
  }
}