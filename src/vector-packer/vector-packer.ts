export interface Vector3 {
  x: number,
  y: number,
  z: number,
}

export class VectorPacker {
  static packCellVec3(x: number, y: number, z: number): number {
    x &= 0x1f;
    y &= 0x1f;
    z &= 0x1f;

    return x | (y << 5) | (z << 10);
  }

  static packCellVec3AndDir(
    x: number,
    y: number,
    z: number,
    dirMask: number
  ): number {
    x &= 0x1f;
    y &= 0x1f;
    z &= 0x1f;
    dirMask &= 0xff;
    return x | (y << 5) | (z << 10) | (dirMask << 15);
  }

  static unpackCellVec3AndDir(packedValue: number): {
    x: number;
    y: number;
    z: number;
    dirs: number[];
  } {
    const x = packedValue & 0x1f;
    const y = (packedValue >> 5) & 0x1f;
    const z = (packedValue >> 10) & 0x1f;
    const dirMask = (packedValue >> 15) & 0xff;
    const dirs: number[] = [];
    for (let i = 0; i <= 6; i++) {
      if (dirMask & (1 << i)) {
        dirs.push(i);
      }
    }

    return { x, y, z, dirs };
  }

  static unpackCellVec3(packed: number): Vector3 {
    let x = packed & 0x1f;
    let y = (packed >> 5) & 0x1f;
    let z = (packed >> 10) & 0x1f;
    return { x, y, z };
  }

  static packChunkVec3(x: number, y: number, z: number): bigint {
    const maxValue = (1 << 20) - 1;
    const minValue = -(1 << 20);
    if (
      x < minValue ||
      x > maxValue ||
      y < minValue ||
      y > maxValue ||
      z < minValue ||
      z > maxValue
    ) {
      throw new Error("Values must be in the range [-1_048_576, 1_048_575]");
    }

    const packedX = (BigInt(x) & 0x1fffffn) << 42n;
    const packedY = (BigInt(y) & 0x1fffffn) << 21n;
    const packedZ = BigInt(z) & 0x1fffffn;

    return packedX | packedY | packedZ;
  }

  unpackChunkVec3(packed: bigint): Vector3 {
    // Извлекаем значения
    const x = Number((packed >> 42n) & 0x1fffffn);
    const y = Number((packed >> 21n) & 0x1fffffn);
    const z = Number(packed & 0x1fffffn);
    const signExtend = (value: number) =>
      value & 0x100000 ? value - 0x200000 : value;

    return {
      x: signExtend(x),
      y: signExtend(y),
      z: signExtend(z),
    };
  }
}
