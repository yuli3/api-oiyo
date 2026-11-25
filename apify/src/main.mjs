import { Actor, log } from "apify";
import { DEFAULT_ENDPOINT, InputError, callTool, listTools, normalizeInput } from "./core.mjs";

// Pay-per-event: one `calculation` event per successful tool result. Failed or refused calls and
// the tool catalog are free. Prices live in Apify Console (Publication → Monetization).
await Actor.init();
try {
  const input = (await Actor.getInput()) ?? {};
  const endpoint = process.env.OIYO_MCP_ENDPOINT || DEFAULT_ENDPOINT;
  const { listTools: wantCatalog, calls } = normalizeInput(input);

  if (wantCatalog) {
    const catalog = await listTools(fetch, endpoint);
    await Actor.pushData(catalog);
    await Actor.setStatusMessage(`Listed ${catalog.length} tools (free).`);
  } else {
    let charged = 0;
    for (const call of calls) {
      const item = await callTool(fetch, endpoint, call);
      if (item.ok) {
        const charge = await Actor.charge({ eventName: "calculation" });
        if (charge.eventChargeLimitReached && !charge.chargedCount) {
          await Actor.setStatusMessage("Stopped: the maximum charge for this run was reached.");
          break;
        }
        charged += 1;
      }
      await Actor.pushData(item);
    }
    await Actor.setStatusMessage(`${charged} of ${calls.length} calculations succeeded.`);
  }
  await Actor.exit();
} catch (error) {
  if (error instanceof InputError) {
    log.error(error.message);
    await Actor.fail(error.message);
  } else {
    throw error;
  }
}
