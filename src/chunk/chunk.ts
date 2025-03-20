import { Vector3, VectorPacker } from "../vector-packer/vector-packer";
import { CELL_TYPE } from "./cell";

export const CHUNK_SIZE = 32;
export const CHUNK_SIZE_P = CHUNK_SIZE + 2;

export class Chunk {
  private cells: Map<number, CELL_TYPE> = new Map();
  private cellPositions: Set<number> = new Set();

  setCells(positions: Vector3[], cellTypes: CELL_TYPE[]) {
    for (let i = 0; i < positions.length; i++) {
      const key = VectorPacker.packCellVec3AndDir(
        positions[i].x,
        positions[i].y,
        positions[i].z,
        0b0000000
      );
      const vectorBits = key & 0x7fff;

      if (cellTypes[i] === CELL_TYPE.AIR) {
        this.cells.delete(key);
        this.cellPositions.delete(vectorBits);
        continue;
      }

      this.cells.set(key, cellTypes[i]);
      this.cellPositions.add(vectorBits);
    }
  }

  isEmptyCell(x: number, y: number, z: number): boolean {
    const key = VectorPacker.packCellVec3(x, y, z);
    return !this.cellPositions.has(key);
  }
}