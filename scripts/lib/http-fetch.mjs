/** Global fetch (Node 18+) — used by VGS scripts on Vercel without bundling node-fetch. */
const fetchFn = globalThis.fetch;
if (typeof fetchFn !== "function") {
  throw new Error("global fetch is not available in this Node runtime");
}
export default fetchFn;
