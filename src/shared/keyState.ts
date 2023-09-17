import {ToEnumType, toEnumValue} from './enumGenerator';

const values = ['pressed', 'notPressed'] as const;

export type KeyState = ToEnumType<typeof values>;
export const KeyState = toEnumValue(values);
