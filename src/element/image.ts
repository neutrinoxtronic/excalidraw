// -----------------------------------------------------------------------------
// ExcalidrawImageElement & related helpers
// -----------------------------------------------------------------------------

import { AppClassProperties, AppState, DataURL } from "../types";
import { isInitializedImageElement } from "./typeChecks";
import {
  ExcalidrawElement,
  FileId,
  InitializedExcalidrawImageElement,
} from "./types";

export const loadHTMLImageElement = (dataURL: DataURL) => {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = dataURL;
  });
};

/** NOTE: updates cache even if already populated with given image. Thus,
 * you should filter out the images upstream if you want to optimize this. */
export const updateImageCache = async ({
  fileIds,
  files,
  imageCache,
}: {
  fileIds: FileId[];
  files: AppState["files"];
  imageCache: AppClassProperties["imageCache"];
}) => {
  const updatedFiles = new Map<FileId, true>();

  await Promise.all(
    fileIds.reduce((promises, fileId) => {
      const fileData = files[fileId as string];
      if (fileData && !updatedFiles.has(fileId)) {
        updatedFiles.set(fileId, true);
        return promises.concat(
          (async () => {
            const imagePromise = loadHTMLImageElement(fileData.dataURL);

            // store the promise immediately to indicate there's an in-progress
            // initialization
            imageCache.set(fileId, imagePromise);

            const img = await imagePromise;

            imageCache.set(fileId, img);
          })(),
        );
      }
      return promises;
    }, [] as Promise<any>[]),
  );

  return { imageCache, updatedFiles };
};

export const getInitializedImageElements = (
  elements: readonly ExcalidrawElement[],
) =>
  elements.filter((element) =>
    isInitializedImageElement(element),
  ) as InitializedExcalidrawImageElement[];
