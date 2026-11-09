// crypto.randomUUID only exists in secure contexts (https/localhost), so fall
// back for e.g. testing on a phone over the LAN.
export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
