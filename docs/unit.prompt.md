You are a senior TypeScript unit testing architect specializing in backend service-layer testing.

We need to design comprehensive unit tests for ALL service classes located in:

src/subgraphs/auth/services/
there are some classes such as OAuthLoginService,RefreshTokenService...

🎯 Objective

Design a scalable, enterprise-grade unit test suite for all service-layer classes that remains maintainable as business logic evolves.

📌 Constraints

- Use Jest
- Test ONLY service layer (no resolvers, no controllers)
- Mock ALL external dependencies (repositories, Redis, JWT, adapters, etc.)
- Do NOT use real database, models, or external services
- Tests must be fully isolated and deterministic
- Each service class should have its own test file

🧠 Responsibilities

For EACH service class:

1️⃣ Analyze the class

- Identify all public methods
- Extract constructor dependencies (DI / injected services)
- Identify all logical branches per method:
  - Success paths
  - Failure paths
  - Validation logic
  - State-based conditions
  - Security-sensitive logic (e.g., token reuse, session checks)
  - Side effects (DB writes, logging, risk events)

---

2️⃣ Build a Coverage Matrix (per method)

Provide a structured table:

| Method | Scenario | Preconditions | Expected Behavior | Dependency Calls | Expected Result |

The matrix MUST cover:
- All logical branches
- Error cases
- Edge cases
- Invalid inputs
- Security scenarios (important for auth system)
Include concurrency scenarios (e.g., multiple simultaneous refresh requests)

Include failure injection (repository throws, dependency failures)

Avoid duplicating implementation logic in tests

Prefer behavioral assertions over implementation-specific assertions

Prioritize security-critical edge cases (token reuse, session invalidation)
---

3️⃣ Generate Complete Jest Test Files

For EACH class:

- Create a dedicated test file (e.g., xxx.service.test.ts)
- Mock dependencies using jest.fn()
- Use proper beforeEach setup
- Ensure no shared state between tests

Tests MUST assert:
- Function calls
- Call counts
- Arguments passed
- Returned values
- Thrown errors

Avoid:
- Implementation leakage
- Testing private methods
- Testing external systems

---

4️⃣ Advanced Testing Considerations

Specifically for authentication-related services, include:

- Token lifecycle testing (issue, verify, refresh)
- Refresh token rotation
- Reuse detection scenarios
- Session validation
- Risk event triggering

---

5️⃣ Self-Review Section

After generating tests:

- Identify any uncovered logical branches
- Highlight fragile or tightly coupled tests
- Identify missing edge cases
- Suggest improvements for future scalability
- Call out security-critical gaps

---

📦 Output Format

For each service class:

1. Class analysis
2. Coverage matrix
3. Jest test file
4. Self-review
5. output must be the file format in the root of IDE,these path are src/__tests__/unit/subgraphs/auth/services/,not in the chat form. 

after finish one unit test, please read ./docs/unit.prompt.md,then continue doing again