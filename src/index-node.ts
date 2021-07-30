import { GlobalFonts, createCanvas, Canvas, Path2D } from "@napi-rs/canvas";

import { exportToCanvas } from "./scene/export";
import { getDefaultAppState } from "./appState";

const elements = [
  {
    type: "rectangle",
    version: 101,
    versionNonce: 464074364,
    isDeleted: false,
    id: "LeWpF-voJsY7mjyFMvRjt",
    fillStyle: "hachure",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 2,
    opacity: 100,
    angle: 0,
    x: 702,
    y: 292,
    strokeColor: "#5f3dc4",
    backgroundColor: "transparent",
    width: 365.0000000000001,
    height: 220,
    seed: 1650958332,
    groupIds: [],
    strokeSharpness: "sharp",
    boundElementIds: [],
  },
  {
    id: "iHGJ0QkTWOfXtuwJduSJJ",
    type: "diamond",
    x: 729,
    y: 316,
    width: 317,
    height: 180,
    angle: 0,
    strokeColor: "#5f3dc4",
    backgroundColor: "#40c057",
    fillStyle: "cross-hatch",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 2,
    opacity: 100,
    groupIds: [],
    strokeSharpness: "sharp",
    seed: 143343044,
    version: 188,
    versionNonce: 686999420,
    isDeleted: false,
    boundElementIds: null,
  },
  {
    id: "zIoDeiZXzcKoZIZzZtRcj",
    type: "text",
    x: 670,
    y: 194,
    width: 436,
    height: 46,
    angle: 0,
    strokeColor: "#862e9c",
    backgroundColor: "#40c057",
    fillStyle: "cross-hatch",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 2,
    opacity: 100,
    groupIds: [],
    strokeSharpness: "sharp",
    seed: 646139460,
    version: 119,
    versionNonce: 1923381244,
    isDeleted: false,
    boundElementIds: null,
    text: "Excalidraw & skr-canvas",
    fontSize: 36,
    fontFamily: 1,
    textAlign: "left",
    verticalAlign: "top",
    baseline: 32,
  },
  {
    id: "W3ZTdeiHK-VO-NyjdyTEi",
    type: "freedraw",
    x: 1155,
    y: 400,
    width: 84,
    height: 125,
    angle: 0,
    strokeColor: "#2b8a3e",
    backgroundColor: "#40c057",
    fillStyle: "cross-hatch",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 2,
    opacity: 100,
    groupIds: [],
    strokeSharpness: "round",
    seed: 1808537724,
    version: 70,
    versionNonce: 1826827332,
    isDeleted: false,
    boundElementIds: null,
    points: [
      [0, 0],
      [0, -1],
      [-1, -4],
      [-1, -8],
      [-4, -11],
      [-5, -15],
      [-9, -20],
      [-13, -26],
      [-15, -29],
      [-19, -33],
      [-20, -34],
      [-21, -34],
      [-21, -35],
      [-22, -35],
      [-24, -35],
      [-25, -35],
      [-25, -36],
      [-25, -36],
      [-27, -34],
      [-31, -32],
      [-34, -30],
      [-37, -26],
      [-41, -21],
      [-45, -17],
      [-49, -14],
      [-51, -9],
      [-53, -6],
      [-54, -2],
      [-55, 1],
      [-57, 4],
      [-57, 7],
      [-57, 11],
      [-57, 14],
      [-57, 18],
      [-57, 21],
      [-55, 24],
      [-53, 27],
      [-52, 31],
      [-49, 34],
      [-49, 36],
      [-47, 38],
      [-45, 41],
      [-44, 44],
      [-41, 47],
      [-39, 50],
      [-36, 54],
      [-33, 58],
      [-31, 61],
      [-29, 63],
      [-26, 65],
      [-26, 66],
      [-25, 66],
      [-25, 66],
      [-22, 69],
      [-17, 72],
      [-14, 74],
      [-10, 76],
      [-8, 77],
      [-8, 78],
      [-7, 78],
      [-5, 78],
      [0, 82],
      [9, 85],
      [18, 86],
      [23, 88],
      [26, 89],
      [26, 88],
      [27, 86],
      [27, 86],
    ],
    pressures: [],
    simulatePressure: true,
    lastCommittedPoint: null,
  },
  {
    id: "MgzAUstEXyDXGj8i31NYm",
    type: "freedraw",
    x: 1156,
    y: 406,
    width: 90,
    height: 131,
    angle: 0,
    strokeColor: "#2b8a3e",
    backgroundColor: "#40c057",
    fillStyle: "cross-hatch",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 2,
    opacity: 100,
    groupIds: [],
    strokeSharpness: "round",
    seed: 661105148,
    version: 118,
    versionNonce: 1061144260,
    isDeleted: false,
    boundElementIds: null,
    points: [
      [0, 0],
      [1, -1],
      [2, -2],
      [6, -6],
      [10, -10],
      [16, -15],
      [20, -18],
      [23, -20],
      [24, -21],
      [25, -21],
      [25, -22],
      [26, -22],
      [26, -24],
      [28, -25],
      [30, -27],
      [34, -30],
      [35, -32],
      [37, -32],
      [38, -33],
      [38, -34],
      [39, -35],
      [39, -36],
      [40, -36],
      [40, -36],
      [41, -36],
      [42, -37],
      [42, -38],
      [42, -39],
      [42, -40],
      [44, -40],
      [46, -43],
      [49, -44],
      [51, -44],
      [51, -45],
      [53, -45],
      [54, -45],
      [54, -45],
      [58, -44],
      [61, -43],
      [66, -40],
      [71, -38],
      [74, -36],
      [77, -34],
      [80, -32],
      [82, -29],
      [85, -27],
      [86, -24],
      [86, -23],
      [88, -20],
      [89, -16],
      [89, -13],
      [89, -10],
      [90, -7],
      [90, -3],
      [90, 1],
      [90, 5],
      [90, 8],
      [90, 11],
      [90, 14],
      [89, 16],
      [88, 19],
      [87, 22],
      [86, 24],
      [86, 27],
      [86, 28],
      [84, 30],
      [83, 32],
      [82, 34],
      [82, 35],
      [80, 36],
      [79, 38],
      [78, 40],
      [75, 42],
      [72, 44],
      [71, 45],
      [70, 47],
      [68, 48],
      [66, 50],
      [64, 52],
      [62, 53],
      [61, 54],
      [59, 56],
      [57, 58],
      [56, 59],
      [55, 59],
      [55, 60],
      [54, 60],
      [52, 63],
      [50, 65],
      [47, 68],
      [46, 68],
      [46, 69],
      [46, 70],
      [44, 71],
      [44, 72],
      [43, 72],
      [42, 74],
      [40, 75],
      [39, 76],
      [38, 77],
      [37, 78],
      [36, 79],
      [36, 80],
      [34, 81],
      [34, 82],
      [34, 82],
      [34, 83],
      [32, 84],
      [31, 84],
      [31, 84],
      [30, 84],
      [30, 85],
      [30, 85],
      [29, 85],
      [28, 85],
      [28, 86],
      [28, 86],
    ],
    pressures: [],
    simulatePressure: true,
    lastCommittedPoint: null,
  },
];

GlobalFonts.registerFromPath("./public/Virgil.woff2", "Virgil");
GlobalFonts.registerFromPath("./public/Cascadia.woff2", "Cascadia");

// @ts-expect-error
global.Path2D = Path2D;

const canvas = exportToCanvas(
  elements as any,
  {
    ...getDefaultAppState(),
    offsetTop: 0,
    offsetLeft: 0,
    width: 0,
    height: 0,
  },
  {
    exportBackground: true,
    viewBackgroundColor: "#ffffff",
  },
  (width, height) => ({
    canvas: (createCanvas(width, height) as unknown) as HTMLCanvasElement,
    scale: 1.0,
  }),
);

const fs = require("fs");
const out = ((canvas as unknown) as Canvas).encodeSync("png");
fs.writeFileSync("test.png", out);
console.info("test.png was created.");
