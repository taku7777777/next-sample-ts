import {Acceleration} from './acceleration';
import {Dimensions} from './dimensions';
import {Position} from './position';
import {TimeDuration} from './timeDuration';
import {Velocity} from './velocity';

export type PhysicalObject = {
  position: Position;
  velocity: Velocity;
  maxVelocity: Velocity;
  acceleration: Acceleration;
  dimensions: Dimensions;
  // mass: number | 'infinite';
};

export const PhysicalObject = {
  initializeAcceleration: <P extends PhysicalObject>(current: P): P => ({
    ...current,
    acceleration: Acceleration.initialize(),
  }),

  addAcceleration:
    <P extends PhysicalObject>(current: P) =>
    (acceleration: Acceleration): P => ({
      ...current,
      acceleration: Acceleration.add(current.acceleration)(acceleration),
    }),

  reflectAcceleration:
    <P extends PhysicalObject>(current: P) =>
    (duration: TimeDuration): P => ({
      ...current,
      velocity: PhysicalObject.shrinkVelocityIfExceedsMax(current)(
        Velocity.reflectAcceleration(current.velocity)(current.acceleration)(duration)
      ),
    }),

  reflectVelocity:
    <P extends PhysicalObject>(current: P) =>
    (duration: TimeDuration): P => ({
      ...current,
      position: Position.reflectVelocity(current.position)(current.velocity)(duration),
    }),

  /**
   * 速度の絶対値が最大値を超えないようにする
   */
  shrinkVelocityIfExceedsMax:
    (current: PhysicalObject) =>
    (velocity: Velocity): Velocity => {
      const maxVelocityX = current.maxVelocity.x > 0 ? current.maxVelocity.x : -current.maxVelocity.x;
      const maxVelocityY = current.maxVelocity.y > 0 ? current.maxVelocity.y : -current.maxVelocity.y;
      return {
        x: velocity.x > maxVelocityX ? maxVelocityX : velocity.x < -maxVelocityX ? -maxVelocityX : velocity.x,
        y: velocity.y > maxVelocityY ? maxVelocityY : velocity.y < -maxVelocityY ? -maxVelocityY : velocity.y,
      };
    },

  isBlockedBy:
    <P extends PhysicalObject>(current: P) =>
    (next: P) =>
    (other: PhysicalObject): P => {
      const blockX1 = other.position.x - other.dimensions.width / 2;
      const blockX2 = other.position.x + other.dimensions.width / 2;
      const blockY1 = other.position.y - other.dimensions.height / 2;
      const blockY2 = other.position.y + other.dimensions.height / 2;

      const isOverlapping =
        (a1: number) =>
        (a2: number) =>
        (b1: number) =>
        (b2: number): boolean => {
          if (a2 < b1) {
            return false;
          }
          if (b2 < a1) {
            return false;
          }
          return true;
        };

      if (current.position.y >= 120 && next.position.y < 120) {
        console.log(
          'check isBlockedBy',
          current,
          next,
          other,
          current.position.y - current.dimensions.height / 2,
          next.position.y - next.dimensions.height / 2,
          blockY2
        );
      }

      if (
        (current.velocity.y > 0 || next.velocity.y > 0) &&
        current.position.y + current.dimensions.height / 2 <= blockY1 &&
        blockY1 <= next.position.y + next.dimensions.height / 2 &&
        (isOverlapping(blockX1)(blockX2)(current.position.x - current.dimensions.width / 2)(
          current.position.x + current.dimensions.width / 2
        ) ||
          isOverlapping(blockX1)(blockX2)(next.position.x - next.dimensions.width / 2)(
            next.position.x + next.dimensions.width / 2
          ))
      ) {
        return {
          ...next,
          position: {...next.position, y: blockY1 - next.dimensions.height / 2},
          velocity: {...next.velocity, y: -next.velocity.y / 2},
          acceleration: {...next.acceleration, y: 0},
        };
      }
      if (
        (current.velocity.y < 0 || next.velocity.y < 0) &&
        next.position.y - next.dimensions.height / 2 <= blockY2 &&
        blockY2 <= current.position.y - current.dimensions.height / 2 &&
        (isOverlapping(blockX1)(blockX2)(current.position.x - current.dimensions.width / 2)(
          current.position.x + current.dimensions.width / 2
        ) ||
          isOverlapping(blockX1)(blockX2)(next.position.x - next.dimensions.width / 2)(
            next.position.x + next.dimensions.width / 2
          ))
      ) {
        return {
          ...next,
          position: {...next.position, y: blockY2 + next.dimensions.height / 2},
          velocity: {...next.velocity, y: -next.velocity.y / 4},
          acceleration: {...next.acceleration, y: 0},
        };
      }
      if (
        (current.velocity.x > 0 || next.velocity.x > 0) &&
        current.position.x + current.dimensions.width / 2 < blockX1 &&
        blockX1 < next.position.x + next.dimensions.width / 2 &&
        (isOverlapping(blockY1)(blockY2)(current.position.y - current.dimensions.height / 2)(
          current.position.y + current.dimensions.height / 2
        ) ||
          isOverlapping(blockY1)(blockY2)(next.position.y - next.dimensions.height / 2)(
            next.position.y + next.dimensions.height / 2
          ))
      ) {
        return {
          ...next,
          position: {...next.position, x: blockX1 - next.dimensions.width / 2},
          velocity: {...next.velocity, x: -next.velocity.x / 2},
          acceleration: {...next.acceleration, x: 0},
        };
      }
      if (
        (current.velocity.x < 0 || next.velocity.x < 0) &&
        next.position.x - next.dimensions.width / 2 < blockX2 &&
        blockX2 < current.position.x - current.dimensions.width / 2 &&
        (isOverlapping(blockY1)(blockY2)(current.position.y - current.dimensions.height / 2)(
          current.position.y + current.dimensions.height / 2
        ) ||
          isOverlapping(blockY1)(blockY2)(next.position.y - next.dimensions.height / 2)(
            next.position.y + next.dimensions.height / 2
          ))
      ) {
        return {
          ...next,
          position: {...next.position, x: blockX2 + next.dimensions.width / 2},
          velocity: {...next.velocity, x: -next.velocity.x / 2},
          acceleration: {...next.acceleration, x: 0},
        };
      }

      return next;
    },
};
