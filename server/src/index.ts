// server/src/index.ts
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { seedProductsIfEmpty } from "./data/products.seed.js";

async function main() {
  await connectDb();
  await seedProductsIfEmpty();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`✅ Server running on http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error("❌ Fatal:", e);
  process.exit(1);
});
