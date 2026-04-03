You are a senior backend architect.

Generate production-level Node.js TypeScript code for Apollo Federation subgraphs.

Tech stack must be:

- Node.js
- TypeScript
- Apollo Server (Federation Subgraph)
- tsyringe for Dependency Injection
- Mongoose for MongoDB

Follow STRICT layered architecture.

Architecture order must be:

schema.graphql
→ resolvers
→ services
→ repositories
→ models

Never violate this dependency direction.

Resolvers call Services.
Services call Repositories.
Repositories interact with Mongoose Models.

Do NOT let resolvers access models directly.

Use clean dependency injection with tsyringe.

------------------------------------------------

Project structure must look like:

src/subgraphs/auth/

    schema.graphql

    resolvers/
        auth.resolver.ts

    services/
        auth.service.ts

    repositories/
        auth.repository.ts

    models/
        auth.model.ts

    container/
        registerDependencies.ts

    index.ts

------------------------------------------------

Coding rules

1. Use TypeScript types everywhere
2. Use async/await
3. Inject repositories into services
4. Inject services into resolvers
5. Use tsyringe container
6. Use Mongoose schema + model
7. Support Apollo Federation entity reference
8. Use clean production naming
9. Avoid business logic in resolvers
10. Services contain business logic

------------------------------------------------

Generate the following subgraphs:

1️⃣ notification-subgraph
2️⃣ search-subgraph
3️⃣ analytics-subgraph
4️⃣ admin-subgraph

------------------------------------------------

Each subgraph must include:

✔ schema.graphql
✔ resolvers
✔ service layer
✔ repository layer
✔ mongoose model
✔ dependency container
✔ index.ts


------------------------------------------------

Federation design rules:


notification entity is owned by notification-subgraph.

search entity is owned by search-subgraph.

analytics entity is owned by analytics-subgraph.

Admin entity is owned by admin-subgraph.

Use:

@key(fields: "id")

for entities.

If one subgraph needs to call another subgraph, it MUST use an adapter layer.

Direct calls between services or repositories across subgraphs are NOT allowed.

Use the Adapter / Anti-Corruption Layer pattern from Domain Driven Design.

Example:

auth-subgraph → user-subgraph

auth services must call a UserAdapter instead of calling user services directly.

Example structure:

adapters/
user.adapter.ts
tenant.adapter.ts

These adapters communicate with other subgraphs via GraphQL or SDK clients.

Services must depend only on adapters, never on external subgraph services.

Follow the same architecture used in auth-subgraph.

------------------------------------------------

Relationships

User ↔ Tenant
many to many through Membership

Tenant → Listing
one to many

Tenant → BillingAccount
one to one

User actions → AuditLog
many

------------------------------------------------

Example style for models:

Use mongoose schema

Example:

const TenantSchema = new Schema(
{
   name: String,
   slug: String,
   createdAt: Date
})

export const TenantModel = model("Tenant", TenantSchema)

------------------------------------------------

Example service pattern:

@injectable()
export class TenantService {

 constructor(
   @inject(TOKENS.TenantRepository)
   private repo: TenantRepository
 ) {}

 async createTenant(data) {
   return this.repo.create(data)
 }

}

------------------------------------------------

Repository pattern example:

@injectable()
export class TenantRepository {

 constructor(
   @inject(TOKENS.TenantModel)
   private model: Model<TenantDocument>
 ) {}

 async create(data){
   return this.model.create(data)
 }

}

------------------------------------------------

Resolver pattern example:

export const resolvers = {

 Mutation: {

   createTenant: async (_, { input }, { container }) => {

     const service = container.resolve(TenantService)

     return service.createTenant(input)

   }

 }

}

------------------------------------------------

Output format:

Generate code for ONE subgraph at a time.

Start with:

tenant-subgraph

Then:

Listing-subgraph

Then:

billing-subgraph

Then:

audit-subgraph

------------------------------------------------

Important:

The code must be production ready.

No pseudo code.
No comments like "implement later".

You will simulate multiple parallel development threads.

Create separate development threads for each subgraph.

Thread A → tenant-subgraph
Thread B → Listing-subgraph
Thread C → billing-subgraph
Thread D → audit-subgraph

Each thread must independently generate the full subgraph architecture:

schema.graphql
models
repositories
services
resolvers
adapters (if needed)
container/registerDependencies.ts
index.ts

Threads must NOT mix code between subgraphs.

Each thread must respect the architecture rules:

schema → resolvers → services → repositories → models

If a subgraph needs to call another subgraph, it must use an Adapter layer and SDK client.

Each thread should produce production-ready TypeScript code.

Output structure must be clearly separated by thread:

===== THREAD A : tenant-subgraph =====
(code)

===== THREAD B : Listing-subgraph =====
(code)

===== THREAD C : billing-subgraph =====
(code)

===== THREAD D : audit-subgraph =====
(code)

Do not merge threads.
Each thread is an independent subgraph implementation.


Everything must compile.
