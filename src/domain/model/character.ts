import {KeyType} from '@/shared/keyType';
import {PhysicalObject} from './physicalObject';
import {KeyState} from '@/shared/keyState';
import {Acceleration} from './acceleration';

const ACCELERATION_HORIZONTAL = 0.0005;
const ACCELERATION_VERTICAL = 0.0005;

export type Character = PhysicalObject & {key: 'mainCharacter'; isLanding: boolean};

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
    const effective = current.isLanding ? 1 : 0.05;
    if (keyState.right === KeyState.pressed && keyState.left !== KeyState.pressed) {
      return ACCELERATION_HORIZONTAL * effective;
    }
    if (keyState.right !== KeyState.pressed && keyState.left === KeyState.pressed) {
      return -ACCELERATION_HORIZONTAL * effective;
    }

    if (current.isLanding) {
      // TODO 仮実装、接地面の摩擦力によって決まる
      return -current.velocity.x / 50;
    }

    return 0;
  };

const covertUserInputToAccelerationVertical =
  (current: Character) =>
  (keyState: {[key in KeyType]: KeyState}): Acceleration['y'] => {
    if (keyState.up === KeyState.pressed && keyState.down !== KeyState.pressed && current.isLanding) {
      return ACCELERATION_VERTICAL * 30;
    }
    if (keyState.up !== KeyState.pressed && keyState.down === KeyState.pressed) {
      return -ACCELERATION_VERTICAL;
    }
    // TODO 仮実装、接地面の摩擦力によって決まる
    return 0;
  };
