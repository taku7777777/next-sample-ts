import {ToEnumType, toEnumValue} from './enumGenerator';

const values = ['up', 'down', 'right', 'left'] as const;

const fromKeyEventIndex = (index: number): KeyType | undefined => {
  switch (index) {
    case 37:
      return KeyType.left;
    case 38:
      return KeyType.up;
    case 39:
      return KeyType.right;
    case 40:
      return KeyType.down;
    default:
      return undefined;
  }
};

export type KeyType = ToEnumType<typeof values>;
export const KeyType = {...toEnumValue(values), fromKeyEventIndex};
