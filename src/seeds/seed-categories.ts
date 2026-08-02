// seed-categories.ts

import CategoryModel from "@/shared/category/infrastructure/category.model";

await CategoryModel.bulkCreate([
  {
    id: crypto.randomUUID(),
    name: "apartment",
  },
  {
    id: crypto.randomUUID(),
    name: "house",
  },
  {
    id: crypto.randomUUID(),
    name: "villa",
  },
  {
    id: crypto.randomUUID(),
    name: "hotel",
  },
  {
    id: crypto.randomUUID(),
    name: "garden",
  },
  {
    id: crypto.randomUUID(),
    name: "flower",
  },
  {
    id: crypto.randomUUID(),
    name: "beach",
  },
  {
    id: crypto.randomUUID(),
    name: "mountain",
  },
]);