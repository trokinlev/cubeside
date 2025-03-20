import { Vector3 } from "../vector-packer/vector-packer";

export const CELL_DIRS: Record<string, Vector3> = {
  top: { x: 0, y: 1, z: 0 }, // 0
  down: { x: 0, y: -1, z: 0 }, // 1
  right: { x: 1, y: 0, z: 0 }, // 2
  left: { x: -1, y: 0, z: 0 }, // 4
  front: { x: 0, y: 0, z: -1 }, // 5
  back: { x: 0, y: 0, z: 1 }, // 6
};

export enum CELL_TYPE {
  AIR = 0,
  STONE = 1,
}
