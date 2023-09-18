import {KeyState} from '@/shared/keyState';
import {KeyType} from '@/shared/keyType';
import {MutableRefObject, useCallback, useEffect, useRef} from 'react';

// 監視する必要のあるすべてのキーの状態
type AllKeyState = {
  [key in KeyType]: KeyState;
};

export const useKeyManager = (keyState: MutableRefObject<AllKeyState>) => {
  const updateKeyState = useCallback(
    (keyType: KeyType, state: KeyState) => {
      keyState.current = {...keyState.current, [keyType]: state};
    },
    [keyState]
  );

  // initialize
  useEffect(() => {
    const _updateKeyState = (keyState: KeyState) => (event: any) => {
      try {
        const keyEventIndex = Number(event.keyCode);
        const keyType = KeyType.fromKeyEventIndex(keyEventIndex);
        if (!keyType) {
          return;
        }
        updateKeyState(keyType, keyState);
      } catch (_) {
        return;
      }
    };
    document.addEventListener('keydown', _updateKeyState(KeyState.pressed), false);
    document.addEventListener('keyup', _updateKeyState(KeyState.notPressed), false);
  }, [updateKeyState]);
};
