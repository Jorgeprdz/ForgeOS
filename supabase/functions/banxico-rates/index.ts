import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  FUNCTION_VERSION,
  createBanxicoHandler,
} from "./logic.mjs";

const handler = createBanxicoHandler({
  getToken: () => Deno.env.get("BANXICO_TOKEN"),
  fetchImpl: globalThis.fetch,
});

console.log(`BANXICO_RATES_FUNCTION=${FUNCTION_VERSION}`);
serve(handler);
