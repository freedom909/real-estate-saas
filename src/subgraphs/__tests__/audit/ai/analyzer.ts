// ai/analyzer.ts

export async function analyzeResult(results: any[]) {
  const issues: string[] = [];

  for (const r of results) {
    if (r.result.errors) {
      issues.push(`
❌ Test: ${r.name}
Error: ${r.result.errors[0].message}
      `);
    }
  }

  if (issues.length === 0) {
    return "✅ All tests passed!";
  }

  return `
发现问题：

${issues.join("\n")}

👉 建议：
- 检查 DTO validation
- 检查 resolver 参数
- 检查 context.user
`;
}