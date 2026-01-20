import { build } from "esbuild";

await build({
  entryPoints: ["generated/prisma/client.ts"],
  outdir: "generated/prisma",
  platform: "node",
  format: "esm",
  target: "node18",
  sourcemap: false,
  bundle: false
});

console.log("✅ Prisma client compiled to JS");
