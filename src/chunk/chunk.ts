import { Vector3, VectorPacker } from "../vector-packer/vector-packer";
import { CELL_TYPE } from "./cell";

export const CHUNK_SIZE = 32;
export const CHUNK_SIZE_P = CHUNK_SIZE + 2;

export class Chunk {
  private xy: Uint8Array[] = Array.from(
    { length: CHUNK_SIZE_P ** 2 },
    () => new Uint8Array(Math.ceil(CHUNK_SIZE_P / 8))
  );
  private zy: Uint8Array[] = Array.from(
    { length: CHUNK_SIZE_P ** 2 },
    () => new Uint8Array(Math.ceil(CHUNK_SIZE_P / 8))
  );
  private xz: Uint8Array[] = Array.from(
    { length: CHUNK_SIZE_P ** 2 },
    () => new Uint8Array(Math.ceil(CHUNK_SIZE_P / 8))
  );
  private cells: Map<number, CELL_TYPE> = new Map();
  private cellPositions: Set<number> = new Set();

  setCells(positions: Vector3[], cellTypes: CELL_TYPE[]) {
    for (let i = 0; i < positions.length; i++) {
      const { x, y, z } = positions[i];
      const key = VectorPacker.packCellVec3AndDir(x, y, z, 0b0000000);
      const vectorBits = key & 0x7fff;

      if (cellTypes[i] === CELL_TYPE.AIR) {
        this.xy[x + y * CHUNK_SIZE][0] &= ~(1 << z);
        this.zy[z + y * CHUNK_SIZE][0] &= ~(1 << x);
        this.xz[x + z * CHUNK_SIZE][0] &= ~(1 << y);
        this.cells.delete(key);
        this.cellPositions.delete(vectorBits);
        continue;
      }

      this.xy[x + y * CHUNK_SIZE][0] |= 1 << z;
      this.zy[z + y * CHUNK_SIZE][0] |= 1 << x;
      this.xz[x + z * CHUNK_SIZE][0] |= 1 << y;
      this.cells.set(key, cellTypes[i]);
      this.cellPositions.add(vectorBits);
    }
  }

  isEmptyCell(x: number, y: number, z: number): boolean {
    const key = VectorPacker.packCellVec3(x, y, z);
    return !this.cellPositions.has(key);
  }

  private buildGeometry() {
    const geometries: any[] = [];

    for (let i = 0; i < CHUNK_SIZE * CHUNK_SIZE; i++) {
      const forntMask = ~(this.xy[i][0] >> 1) & this.xy[i][0];
      const backMask = ~(this.xy[i][0] << 1) & this.xy[i][0];
      const topMask = ~(this.xz[i][0] >> 1) & this.xz[i][0];
      const bottomMask = ~(this.xz[i][0] << 1) & this.xz[i][0];
      const rightMask = this.zy[i][0] & ~(this.zy[i][0] >> 1);
      const leftMask = this.zy[i][0] & ~(this.zy[i][0] << 1);

      for (let j = 0; j < CHUNK_SIZE; j++) {
        if (forntMask & (1 << j)) {
          geometries.push(
            generateCube(i % CHUNK_SIZE, Math.floor(i / CHUNK_SIZE), j, [0])
          );
        }

        if (backMask & (1 << j)) {
          geometries.push(
            generateCube(i % CHUNK_SIZE, Math.floor(i / CHUNK_SIZE), j, [1])
          );
        }

        if (topMask & (1 << j)) {
          geometries.push(
            generateCube(i % CHUNK_SIZE, j, Math.floor(i / CHUNK_SIZE), [2])
          );
        }

        if (bottomMask & (1 << j)) {
          geometries.push(
            generateCube(i % CHUNK_SIZE, j, Math.floor(i / CHUNK_SIZE), [3])
          );
        }

        if (leftMask & (1 << j)) {
          geometries.push(
            generateCube(j, Math.floor(i / CHUNK_SIZE), i % CHUNK_SIZE, [5])
          );
        }

        if (rightMask & (1 << j)) {
          geometries.push(
            generateCube(j, Math.floor(i / CHUNK_SIZE), i % CHUNK_SIZE, [4])
          );
        }
      }
    }

    this.geometry = mergeGeometries(geometries);
  }
}