export type ToEnumType<E> = E extends readonly [...infer U] ? (U extends (infer V)[] ? V : never) : never;
// export const toEnumValue = <E extends readonly [...unknown[]]>(values: E) => ({
//   ...(Object.fromEntries(values.map(key => [key, key])) as {
//     [key in KeyType]: key;
//   }),
//   values: values,
// });

export const toEnumValue = <E extends readonly [...string[]]>(values: E) => ({
  ...(Object.fromEntries(values.map(key => [key, key])) as {
    [key in ToEnumType<E>]: key;
  }),
  values: () => values,
});
