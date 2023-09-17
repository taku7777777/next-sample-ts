export const ObjectUtils = {
  fromEntries: <K extends string, V>(entries: [K, V][]) => Object.fromEntries(entries) as Record<K, V>,
};
