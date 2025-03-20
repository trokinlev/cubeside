export class FaceCuller {
  private xy: Uint8Array[] = Array.from(
    { length: CHUNK_SIZE ** 2 },
    () => new Uint8Array(1)
  );
  private zy: Uint8Array[] = Array.from(
    { length: CHUNK_SIZE ** 2 },
    () => new Uint8Array(1)
  );
  private xz: Uint8Array[] = Array.from(
    { length: CHUNK_SIZE ** 2 },
    () => new Uint8Array(1)
  );

  addBlock(x: number, y: number, z: number) {
    this.xy[x + y * CHUNK_SIZE][0] |= 1 << z;
    this.zy[z + y * CHUNK_SIZE][0] |= 1 << x;
    this.xz[x + z * CHUNK_SIZE][0] |= 1 << y;
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
