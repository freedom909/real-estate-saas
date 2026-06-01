function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
  }
}