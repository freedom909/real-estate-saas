import { defineRailway, github, project, service } from "railway/iac";// Cannot find module 'railway/iac' or its corresponding type declarations.

export default defineRailway(() => {
  const backend = service("backend", {
    source: github("freedom909/real-estate-saas", { rootDirectory: "." }),
    build: "npx tsx scripts/start-railway.tsx",
    healthcheckPath: "/health",
  });

  const frontend = service("frontend", {
    source: github("freedom909/real-estate-saas", { rootDirectory: "frontend" }),
    build: "npm run build",
    healthcheckPath: "/",
  });

  return project("minshuku", {
    resources: [backend, frontend],
  });
});
