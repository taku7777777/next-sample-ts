import {KeyType} from '@/shared/keyType';
import {PhysicalObject} from './physicalObject';
import {KeyState} from '@/shared/keyState';
import {Acceleration} from './acceleration';

const ACCELERATION_HORIZONTAL = 0.0005;
const ACCELERATION_VERTICAL = 0.0005;

export type Character = PhysicalObject & {key: 'mainCharacter'};

export const Character = {
  covertUserInputToAcceleration:
    (current: Character) =>
    (input: {[key in KeyType]: KeyState}): Acceleration => ({
      x: covertUserInputToAccelerationHorizontal(current)(input),
      y: covertUserInputToAccelerationVertical(current)(input),
    }),
};

const covertUserInputToAccelerationHorizontal =
  (current: Character) =>
  (keyState: {[key in KeyType]: KeyState}): Acceleration['x'] => {
    if (keyState.right === KeyState.pressed && keyState.left !== KeyState.pressed) {
      return ACCELERATION_HORIZONTAL;
    }
    if (keyState.right !== KeyState.pressed && keyState.left === KeyState.pressed) {
      return -ACCELERATION_HORIZONTAL;
    }
    // TODO 仮実装、接地面の摩擦力によって決まる
    return -current.velocity.x / 100;
  };

const covertUserInputToAccelerationVertical =
  (current: Character) =>
  (keyState: {[key in KeyType]: KeyState}): Acceleration['x'] => {
    if (keyState.up === KeyState.pressed && keyState.down !== KeyState.pressed) {
      return ACCELERATION_VERTICAL;
    }
    if (keyState.up !== KeyState.pressed && keyState.down === KeyState.pressed) {
      return -ACCELERATION_VERTICAL;
    }
    // TODO 仮実装、接地面の摩擦力によって決まる
    return -current.velocity.y / 100;
  };
