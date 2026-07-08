// src/wisdom-web/app/permission/User.ts

User {
  id
  email
  role: "guest" | "host" | "admin"
}

Role {
  name: "guest" | "host" | "admin"
  permissions: string[]
}

Permission =
  "listing:create" |
  "listing:edit" |
  "listing:delete" |
  "booking:view" |
  "admin:panel"