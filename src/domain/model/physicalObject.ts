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
};
