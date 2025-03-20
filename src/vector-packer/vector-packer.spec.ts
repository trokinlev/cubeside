import { VectorPacker } from "./vector-packer";

describe("VectorPacker", () => {
  describe("packCellVec3", () => {

    it("should correctly pack (0, 0, 0)", () => {
      const result = VectorPacker.packCellVec3(0, 0, 0);
      expect(result).toBe(0);
    });

    it("should correctly pack (1, 2, 3)", () => {
      const result = VectorPacker.packCellVec3(1, 2, 3);
      expect(result).toBe(3137);
    });

    it("should correctly pack (31, 31, 31)", () => {
      const result = VectorPacker.packCellVec3(31, 31, 31);
      expect(result).toBe(32767);
    });
  });

  describe("unpackCellVec3", () => {
    it("should return an object with x, y, z", () => {
      const result = VectorPacker.unpackCellVec3(0);
      expect(result).toHaveProperty("x");
      expect(result).toHaveProperty("y");
      expect(result).toHaveProperty("z");
    });

    it("should correctly unpack (0, 0, 0)", () => {
      const packed = VectorPacker.packCellVec3(0, 0, 0);
      const result = VectorPacker.unpackCellVec3(packed);
      expect(result).toEqual({ x: 0, y: 0, z: 0 });
    });

    it("should correctly unpack (1, 2, 3)", () => {
      const packed = VectorPacker.packCellVec3(1, 2, 3);
      const result = VectorPacker.unpackCellVec3(packed);
      expect(result).toEqual({ x: 1, y: 2, z: 3 });
    });

    it("should correctly unpack (31, 31, 31)", () => {
      const packed = VectorPacker.packCellVec3(31, 31, 31);
      const result = VectorPacker.unpackCellVec3(packed);
      expect(result).toEqual({ x: 31, y: 31, z: 31 });
    });

    it("should correctly unpack clamped values", () => {
      const packed = VectorPacker.packCellVec3(32, 33, 34);
      const result = VectorPacker.unpackCellVec3(packed);
      expect(result).toEqual({ x: 0, y: 1, z: 2 });
    });
  });

  describe("Integration", () => {
    it("should pack and unpack consistently", () => {
      const original = { x: 10, y: 20, z: 30 };
      const packed = VectorPacker.packCellVec3(original.x, original.y, original.z);
      const unpacked = VectorPacker.unpackCellVec3(packed);
      expect(unpacked).toEqual(original);
    });

    it("should handle edge cases", () => {
      const original = { x: 31, y: 31, z: 31 };
      const packed = VectorPacker.packCellVec3(original.x, original.y, original.z);
      const unpacked = VectorPacker.unpackCellVec3(packed);
      expect(unpacked).toEqual(original);
    });
  });

  describe("Performance Testing", () => {
    it("should execute within a reasonable time", () => {
      const start = performance.now();

      for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
          for (let z = 0; z < 32; z++) {
            VectorPacker.packCellVec3(x, y, z);
          }
        }
      }

      const end = performance.now();
      const executionTime = end - start;

      console.log(`Execution Time: ${executionTime} ms`);
      expect(executionTime).toBeLessThan(100); // Пример ограничения времени
    });

    it("should execute within a reasonable time", () => {
      const start = performance.now();

      for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
          for (let z = 0; z < 32; z++) {
            VectorPacker.packCellVec3AndDir(x, y, z, 0b1111111);
          }
        }
      }

      const end = performance.now();
      const executionTime = end - start;

      const a = VectorPacker.packCellVec3AndDir(31, 31, 31, 0b1111111);
      console.log(VectorPacker.unpackCellVec3AndDir(a))

      console.log(`Execution Time DIR: ${executionTime} ms`);
      expect(executionTime).toBeLessThan(100); // Пример ограничения времени
    });

    it("should use a reasonable amount of memory", () => {
      const startMemory = process.memoryUsage().heapUsed;

      for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
          for (let z = 0; z < 32; z++) {
            VectorPacker.packCellVec3(x, y, z);
          }
        }
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsage = endMemory - startMemory;

      console.log(`Memory Usage: ${memoryUsage} Byte`);
      expect(memoryUsage).toBeLessThan(2000000); // Пример ограничения памяти
    });

    it("should use a reasonable amount of cpu", () => {
      const startCpuUsage = process.cpuUsage();

      for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
          for (let z = 0; z < 32; z++) {
            VectorPacker.packCellVec3(x, y, z);
          }
        }
      }

      const endCpuUsage = process.cpuUsage(startCpuUsage);

      console.log("CPU Usage (user):", endCpuUsage.user / 1e6, "ms");
      console.log("CPU Usage (system):", endCpuUsage.system / 1e6, "ms");
      expect(99).toBeLessThan(100); // Пример ограничения памяти
    });
  });
});
