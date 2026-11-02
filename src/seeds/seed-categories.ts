// seed-categories.ts

import CategoryModel from "@/shared/category/infrastructure/category.model";

const names = [
  "apartment",
  "house",
  "villa",
  "hotel",
  "garden",
  "flower",
  "beach",
  "mountain",
];

// Idempotent: re-running the seed must not create duplicate categories.
for (const name of names) {
  const [row, created] = await CategoryModel.findOrCreate({
    where: { name },
    defaults: { id: crypto.randomUUID() },
  });
  console.log(created ? `+ created "${name}" (${row.id})` : `= exists   "${name}"`);
}

console.log(`Categories seeded: ${names.length} checked`);
// Sequelize keeps a connection pool open — exit explicitly or tsx hangs forever.
process.exit(0);
