import {
  buildAcceptedNativeResult107z15p2R9C,
  calculateAcceptedQuote as calculateBaseAcceptedQuote,
  isPdfSelection107z15p2R9C,
  validatePacket,
} from "./forge-accepted-quote-adapter.js";
import {
  buildGmmAcceptedQuoteCalculation,
  isGmmAcceptedQuotePacket,
} from "./forge-gmm-product-decision-adapter.js";

async function calculateAcceptedQuote(packet) {
  validatePacket(packet);
  const nativeResult = buildAcceptedNativeResult107z15p2R9C(packet);
  if (isGmmAcceptedQuotePacket(packet, nativeResult)) {
    return buildGmmAcceptedQuoteCalculation({ packet, nativeResult });
  }
  return calculateBaseAcceptedQuote(packet);
}

const api = Object.freeze({
  calculateAcceptedQuote,
  validatePacket,
  isPdfSelection107z15p2R9C,
  buildAcceptedNativeResult107z15p2R9C,
  isGmmAcceptedQuotePacket,
  buildGmmAcceptedQuoteCalculation,
});

globalThis.ForgeAcceptedQuoteAdapter006 = api;

export {
  buildAcceptedNativeResult107z15p2R9C,
  buildGmmAcceptedQuoteCalculation,
  calculateAcceptedQuote,
  isGmmAcceptedQuotePacket,
  isPdfSelection107z15p2R9C,
  validatePacket,
};
