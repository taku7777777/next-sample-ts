import {TimeDuration} from './timeDuration';
import {Velocity} from './velocity';

export type Position = {
  x: number;
  y: number;
};

export const Position = {
  add:
    (current: Position) =>
    (other: Position): Position => ({
      x: current.x + other.x,
      y: current.y + other.y,
    }),

  reflectVelocity:
    (position: Position) =>
    (velocity: Velocity) =>
    (duration: TimeDuration): Position =>
      Position.add(position)(Velocity.toPositionVector(velocity)(duration)),
};
