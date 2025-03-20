// import { VectorPacker } from "../vector-packer/vector-packer";
// import { CELL_TYPE } from "./cell";
// import { FaceCuller } from "./face-culler";

// describe("Face Culling", () => {
//   describe("Bit mask from the column", () => {
//     it("computeFaceMask", () => {
//       const cells: Map<number, CELL_TYPE> = new Map();
//       const cellPositions: Set<number> = new Set();
//       const positions = [
//         // { x: 0, y: 0, z: 0 },
//         { x: 0, y: 0, z: 1 },
//         // { x: 0, y: 0, z: 3 },
//         // { x: 0, y: 0, z: 4 },
//         // { x: 0, y: 0, z: 6 },
//         // { x: 0, y: 0, z: 7 },
//         // { x: 0, y: 0, z: 8 },
//       ];
//       const cellTypes = [1, 1, 1, 1, 1, 1, 1];

//       for (let i = 0; i < positions.length; i++) {
//         const key = VectorPacker.packCellVec3AndDir(
//           positions[i].x,
//           positions[i].y,
//           positions[i].z,
//           0b0000000
//         );
//         const vectorBits = key & 0x7fff;

//         if (cellTypes[i] === CELL_TYPE.AIR) {
//           cells.delete(key);
//           cellPositions.delete(vectorBits)
//           continue;
//         }

//         cells.set(key, cellTypes[i]);
//         cellPositions.add(vectorBits);
//       }

//       const k = VectorPacker.packCellVec3(0, 1, 0);
//       const kk = VectorPacker.packCellVec3AndDir(0, 1, 0, 0b0001000);
//       const vb = kk & 0x7fff;
//       console.log(k);
//       console.log(vb);

//       // const faceCuller = new FaceCuller();
//       // faceCuller.computeFaceMask(cells);
//       expect(true).toBe(true);
//     });
//   });
// });
