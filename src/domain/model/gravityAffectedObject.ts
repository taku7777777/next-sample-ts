import {PhysicalObject} from './physicalObject';

const LANDING_BUFFER = 0.01;
const GRAVITY = 0.001;

export type GravityAffectedObject = {
  isLanding: boolean;
} & PhysicalObject;

export const GravityAffectedObject = {
  reflectIsLanding:
    <G extends GravityAffectedObject>(current: G) =>
    (blocks: PhysicalObject[]): G => {
      const isLanding = blocks.some(block => GravityAffectedObject.isLanding(current)(block));
      return {...current, isLanding};
    },

  addGravityIfNotLanding: <P extends GravityAffectedObject>(current: P): P => {
    if (current.isLanding) {
      return current;
    }
    return PhysicalObject.addAcceleration(current)({x: 0, y: -GRAVITY});
  },

  isLanding:
    (current: PhysicalObject) =>
    (block: PhysicalObject): boolean => {
      const blockX1 = block.position.x - block.dimensions.width / 2;
      const blockX2 = block.position.x + block.dimensions.width / 2;
      const blockY2 = block.position.y + block.dimensions.height / 2;

      const currentX1 = current.position.x - current.dimensions.width / 2;
      const currentX2 = current.position.x + current.dimensions.width / 2;
      const currentY1 = current.position.y - current.dimensions.height / 2;

      const buffer = LANDING_BUFFER;

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

      if (
        !(current.velocity.y > 0.01) &&
        currentY1 <= blockY2 + buffer &&
        blockY2 - buffer <= currentY1 &&
        isOverlapping(blockX1)(blockX2)(currentX1)(currentX2)
      ) {
        return true;
      }
      return false;
    },
};
