import { cp, mkdir, rm } from "node:fs/promises";

await rm(new URL("./dist", import.meta.url), { recursive: true, force: true });
await mkdir(new URL("./dist", import.meta.url), { recursive: true });
await cp(new URL("./src", import.meta.url), new URL("./dist", import.meta.url), { recursive: true });
await cp(new URL("./manifest.json", import.meta.url), new URL("./dist/manifest.json", import.meta.url));
console.log("TrustMode extension built in apps/extension/dist");
