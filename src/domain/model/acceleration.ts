import {TimeDuration} from './timeDuration';
import {Velocity} from './velocity';

export type Acceleration = {
  x: number;
  y: number;
};

export const Acceleration = {
  initialize: (): Acceleration => ({x: 0, y: 0}),
  add:
    (current: Acceleration) =>
    (other: Acceleration): Acceleration => ({x: current.x + other.x, y: current.y + other.y}),
  toVelocityVector:
    (acceleration: Acceleration) =>
    (duration: TimeDuration): Velocity => ({
      x: acceleration.x * duration,
      y: acceleration.y * duration,
    }),
};
