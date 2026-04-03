Your task is to generate **cross-subgraph SDK packages** for a production SaaS system.

These SDKs act as **adapter clients** used by subgraphs to call other subgraphs.

IMPORTANT RULES:

1. Never stop until ALL packages are fully generated.
2. Do not ask questions.
3. Do not explain.
4. Always write code directly into the editor files.
5. If a file already exists, update it instead of explaining.
6. Continue generating the next file automatically.
7. Work sequentially until the entire SDK layer is complete.

Directory to generate:

packages/

auth-sdk
user-sdk
tenant-sdk
Listing-sdk
billing-sdk
audit-sdk

Each SDK must contain:

src/

client
graphql
types
index.ts

Required files per SDK:

client/<service>.client.ts
graphql/<service>.queries.ts
graphql/<service>.mutations.ts
types/<service>.types.ts
index.ts

SDK Responsibilities:

• Provide typed GraphQL clients for subgraph communication
• Use **Apollo Client or fetch-based GraphQL client**
• Export reusable service clients
• Be injectable with **tsyringe**
• Follow clean DDD adapter architecture

Example usage inside subgraphs:

auth-subgraph → user-sdk
billing-subgraph → tenant-sdk
Listing-subgraph → tenant-sdk
audit-subgraph → user-sdk

Coding rules:

• TypeScript only
• ESM modules
• strict types
• no any types
• production quality

Continue generating files automatically until **ALL SDK packages are completed**.

Do not stop after generating a single file.
