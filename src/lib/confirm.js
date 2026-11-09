/** Ask before wiping a calculator that has something typed in. */
export function confirmReset(hasData) {
  return !hasData || window.confirm('Clear everything in this calculator?');
}
