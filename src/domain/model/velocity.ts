import {Acceleration} from './acceleration';
import {TimeDuration} from './timeDuration';

export type Velocity = {
  x: number;
  y: number;
};

export const Velocity = {
  add:
    (current: Velocity) =>
    (other: Velocity): Velocity => ({
      x: current.x + other.x,
      y: current.y + other.y,
    }),

  reflectAcceleration:
    (current: Velocity) =>
    (acceleration: Velocity) =>
    (duration: TimeDuration): Velocity =>
      Velocity.add(current)(Acceleration.toVelocityVector(acceleration)(duration)),

  toPositionVector: (velocity: Velocity) => (duration: TimeDuration) => ({
    x: velocity.x * duration,
    y: velocity.y * duration,
  }),
};
