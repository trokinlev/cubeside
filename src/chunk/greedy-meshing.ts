const CHUNK_SIZE = 32;
const CHUNK_SIZE_P = CHUNK_SIZE + 2; // с учётом padding

type AxisCols = number[][][]; // 3D массив для хранения битовых данных


  // Создание структуры для хранения битовых данных
  const axisCols: AxisCols = Array.from({ length: 3 }, () =>
    Array.from({ length: CHUNK_SIZE_P }, () => new Array(CHUNK_SIZE_P).fill(0))
  );

  const colFaceMasks: AxisCols = Array.from({ length: 6 }, () =>
    Array.from({ length: CHUNK_SIZE_P }, () => new Array(CHUNK_SIZE_P).fill(0))
  );

  function addVoxelToAxisCols(b: BlockData, x: number, y: number, z: number) {
    if (b.blockType.isSolid()) {
      axisCols[0][z][x] |= 1 << y;
      axisCols[1][y][z] |= 1 << x;
      axisCols[2][y][x] |= 1 << z;
    }
  }

  // Заполнение данными
  const chunk = chunksRefs.chunks[vec3ToIndex({ x: 1, y: 1, z: 1 }, 3)];
  for (let z = 0; z < CHUNK_SIZE; z++) {
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const i = chunk.voxels.length === 1 ? 0 : (z * CHUNK_SIZE + y) * CHUNK_SIZE + x;
        addVoxelToAxisCols(chunk.voxels[i], x + 1, y + 1, z + 1);
      }
    }
  }

  // Обход соседних чанков
  for (const [z, y, x] of [
    [0, CHUNK_SIZE_P - 1],
    [0, CHUNK_SIZE_P - 1],
    [0, CHUNK_SIZE_P - 1],
  ]) {
    const pos = { x: x - 1, y: y - 1, z: z - 1 };
    addVoxelToAxisCols(chunksRefs.getBlock(pos), x, y, z);
  }

  // Face culling
  for (let axis = 0; axis < 3; axis++) {
    for (let z = 0; z < CHUNK_SIZE_P; z++) {
      for (let x = 0; x < CHUNK_SIZE_P; x++) {
        const col = axisCols[axis][z][x];
        colFaceMasks[2 * axis + 0][z][x] = col & ~(col << 1);
        colFaceMasks[2 * axis + 1][z][x] = col & ~(col >> 1);
      }
    }
  }

  // Greedy meshing
  const data: Map<number, Map<number, number[]>>[] = Array.from(
    { length: 6 },
    () => new Map()
  );

  for (let axis = 0; axis < 6; axis++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        let col = colFaceMasks[axis][z + 1][x + 1];
        col >>= 1;
        col &= ~(1 << CHUNK_SIZE);

        while (col !== 0) {
          const y = Math.clz32(col) - 32 + CHUNK_SIZE; // trailing_zeros
          col &= col - 1;

          const voxelPos = getVoxelPos(axis, x, y, z);
          const ao = calculateAO(chunksRefs, voxelPos, axis);

          const currentVoxel = chunksRefs.getBlockNoNeighbour(voxelPos);
          const blockHash = ao | (currentVoxel.blockType << 9);

          if (!data[axis].has(blockHash)) data[axis].set(blockHash, new Map());
          if (!data[axis].get(blockHash)!.has(y))
            data[axis].get(blockHash)!.set(y, []);
          data[axis].get(blockHash)!.get(y)![x] |= 1 << z;
        }
      }
    }
  }

  let vertices: number[] = [];
  for (const [axis, blockData] of data.entries()) {
    for (const [blockAo, axisPlane] of blockData.entries()) {
      const ao = blockAo & 0b111111111;
      const blockType = blockAo >> 9;
      for (const [axisPos, plane] of axisPlane.entries()) {
        const quads = greedyMeshBinaryPlane(plane, lod.size());
        quads.forEach((q) =>
          q.appendVertices(
            vertices,
            getFaceDir(axis),
            axisPos,
            lod,
            ao,
            blockType
          )
        );
      }
    }
  }

  mesh.vertices = vertices;
  if (mesh.vertices.length === 0) {
    return null;
  }

  mesh.indices = generateIndices(mesh.vertices.length);
  return mesh;
}

// Функция для получения позиции вокселя
function getVoxelPos(axis: number, x: number, y: number, z: number): Vec3 {
  switch (axis) {
    case 0:
    case 1:
      return { x, y, z };
    case 2:
    case 3:
      return { x: y, y: z, z: x };
    default:
      return { x, y: z, z: y };
  }
}

// Функция для расчета AO
function calculateAO(
  chunksRefs: ChunksRefs,
  voxelPos: Vec3,
  axis: number
): number {
  let aoIndex = 0;
  ADJACENT_AO_DIRS.forEach((offset, aoI) => {
    const aoSampleOffset = getAOSampleOffset(axis, offset);
    const aoVoxelPos = {
      x: voxelPos.x + aoSampleOffset.x,
      y: voxelPos.y + aoSampleOffset.y,
      z: voxelPos.z + aoSampleOffset.z,
    };
    if (chunksRefs.getBlock(aoVoxelPos).blockType.isSolid()) {
      aoIndex |= 1 << aoI;
    }
  });
  return aoIndex;
}

// Пример генерации индексов
function generateIndices(vertexCount: number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < vertexCount; i += 4) {
    indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
  }
  return indices;
}
