export async function generateTests(schemaSDL): Promise<string> {
  return `
    [
      {
        name: "valid audit log",
        query: \`
          mutation {
            recordAuditLog(
              action: "LOGIN",
              resourceId: "user-1"
            ) {
              id
            }
          }
        \`,
        variables: {},
        context: {
          user: { userId: "u-1" }
        }
      },
      {
        name: "missing resourceId",
        query: \`
          mutation {
            recordAuditLog(
              action: "LOGIN"
            ) {
              id
            }
          }
        \`,
        variables: {},
        context: {
          user: { userId: "u-1" }
        }
      }
    ]
  `;
}

