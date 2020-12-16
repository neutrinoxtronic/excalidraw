import decodePng from "png-chunks-extract";
import tEXt from "png-chunk-text";
import encodePng from "png-chunks-encode";
import { stringToBase64, encode, decode, base64ToString } from "./encode";
import { MIME_TYPES } from "../constants";

// -----------------------------------------------------------------------------
// PNG
// -----------------------------------------------------------------------------

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  if ("arrayBuffer" in blob) {
    return blob.arrayBuffer();
  }
  // Safari
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("couldn't convert blob to ArrayBuffer"));
      }
      resolve(event.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
};

export const getTEXtChunk = async (
  blob: Blob,
): Promise<{ keyword: string; text: string } | null> => {
  const chunks = decodePng(new Uint8Array(await blobToArrayBuffer(blob)));
  const metadataChunk = chunks.find((chunk) => chunk.name === "tEXt");
  if (metadataChunk) {
    return tEXt.decode(metadataChunk.data);
  }
  return null;
};

export const encodePngMetadata = async ({
  blob,
  metadata,
}: {
  blob: Blob;
  metadata: string;
}) => {
  const chunks = decodePng(new Uint8Array(await blobToArrayBuffer(blob)));
  const metadataChunk = tEXt.encode(
    MIME_TYPES.excalidraw,
    JSON.stringify(
      await encode({
        text: metadata,
        compress: true,
      }),
    ),
  );
  // insert metadata before last chunk (iEND)
  chunks.splice(-1, 0, metadataChunk);
  return new Blob([encodePng(chunks)], { type: "image/png" });
};

export const decodePngMetadata = async (blob: Blob) => {
  const metadata = await getTEXtChunk(blob);
  if (metadata?.keyword === MIME_TYPES.excalidraw) {
    try {
      const encodedData = JSON.parse(metadata.text);
      if (!("encoded" in encodedData)) {
        // legacy, un-encoded scene JSON
        if ("type" in encodedData && encodedData.type === "excalidraw") {
          return metadata.text;
        }
        throw new Error("FAILED");
      }
      return await decode(encodedData);
    } catch (error) {
      console.error(error);
      throw new Error("FAILED");
    }
  }
  throw new Error("INVALID");
};

export const getPngMetatdataSize = async ({
  metadata,
}: {
  metadata: string;
}) => {
  const metadataChunk = tEXt.encode(
    MIME_TYPES.excalidraw,
    JSON.stringify(
      await encode({
        text: metadata,
        compress: true,
      }),
    ),
  );

  // Here 12 is magic number!
  return new Blob([metadataChunk.data], { type: "image/png" }).size + 12;
};

// -----------------------------------------------------------------------------
// SVG
// -----------------------------------------------------------------------------

export const encodeSvgMetadata = async ({ text }: { text: string }) => {
  const base64 = await stringToBase64(
    JSON.stringify(await encode({ text })),
    true /* is already byte string */,
  );

  let metadata = "";
  metadata += `<!-- payload-type:${MIME_TYPES.excalidraw} -->`;
  metadata += `<!-- payload-version:2 -->`;
  metadata += "<!-- payload-start -->";
  metadata += base64;
  metadata += "<!-- payload-end -->";

  return metadata;
};

export const decodeSvgMetadata = async ({ svg }: { svg: string }) => {
  if (svg.includes(`payload-type:${MIME_TYPES.excalidraw}`)) {
    const match = svg.match(/<!-- payload-start -->(.+?)<!-- payload-end -->/);
    if (!match) {
      throw new Error("INVALID");
    }
    const versionMatch = svg.match(/<!-- payload-version:(\d+) -->/);
    const version = versionMatch?.[1] || "1";
    const isByteString = version !== "1";

    try {
      const json = await base64ToString(match[1], isByteString);
      const encodedData = JSON.parse(json);
      if (!("encoded" in encodedData)) {
        // legacy, un-encoded scene JSON
        if ("type" in encodedData && encodedData.type === "excalidraw") {
          return json;
        }
        throw new Error("FAILED");
      }
      return await decode(encodedData);
    } catch (error) {
      console.error(error);
      throw new Error("FAILED");
    }
  }
  throw new Error("INVALID");
};

export const getSvgMetatdataSize = async ({ text }: { text: string }) => {
  const metadata = await encodeSvgMetadata({ text });
  return new Blob([metadata], { type: "image/svg+xml" }).size;
};
