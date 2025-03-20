import { VectorPacker } from "../vector-packer/vector-packer";
import { Chunk } from "./chunk";

export class ChunkManager {
  private chunks: Map<bigint, Chunk> = new Map();

  getChunk(x: number, y: number, z: number): Chunk {
    const chunkKey = VectorPacker.packChunkVec3(x, y, z);

    if (!this.chunks.has(chunkKey)) {
      const newChunk = new Chunk();
      this.chunks.set(chunkKey, newChunk);
    }

    return this.chunks.get(chunkKey)!;
  }

  getLeftChunk(x: number, y: number, z: number): Chunk | undefined {
    return this.getNeighborChunk(x - 1, y, z);
  }

  getRightChunk(x: number, y: number, z: number): Chunk | undefined {
    return this.getNeighborChunk(x + 1, y, z);
  }

  getTopChunk(x: number, y: number, z: number): Chunk | undefined {
    return this.getNeighborChunk(x, y + 1, z);
  }

  getBottomChunk(x: number, y: number, z: number): Chunk | undefined {
    return this.getNeighborChunk(x, y - 1, z);
  }

  getFrontChunk(x: number, y: number, z: number): Chunk | undefined {
    return this.getNeighborChunk(x, y, z + 1);
  }

  getBackChunk(x: number, y: number, z: number): Chunk | undefined {
    return this.getNeighborChunk(x, y, z - 1);
  }

  private getNeighborChunk(x: number, y: number, z: number): Chunk | undefined {
    const chunkKey = VectorPacker.packChunkVec3(x, y, z);
    return this.chunks.get(chunkKey);
  }
}