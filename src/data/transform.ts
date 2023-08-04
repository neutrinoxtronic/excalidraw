import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  TEXT_ALIGN,
  VERTICAL_ALIGN,
} from "../constants";
import {
  newElement,
  newLinearElement,
  redrawTextBoundingBox,
} from "../element";
import { bindLinearElement } from "../element/binding";
import {
  ElementConstructorOpts,
  newImageElement,
  newTextElement,
  regenerateId,
} from "../element/newElement";
import {
  getDefaultLineHeight,
  measureText,
  normalizeText,
} from "../element/textElement";
import {
  ExcalidrawBindableElement,
  ExcalidrawElement,
  ExcalidrawEmbeddableElement,
  ExcalidrawFrameElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawGenericElement,
  ExcalidrawImageElement,
  ExcalidrawLinearElement,
  ExcalidrawSelectionElement,
  ExcalidrawTextElement,
  FileId,
  FontFamilyValues,
  TextAlign,
  VerticalAlign,
} from "../element/types";
import { MarkOptional } from "../utility-types";
import { assertNever, getFontString } from "../utils";

export type ValidLinearElement = {
  type: "arrow" | "line";
  x: number;
  y: number;
  label?: {
    text: string;
    fontSize?: number;
    fontFamily?: FontFamilyValues;
    textAlign?: TextAlign;
    verticalAlign?: VerticalAlign;
  } & MarkOptional<ElementConstructorOpts, "x" | "y">;
  end?:
    | (
        | (
            | {
                type: Exclude<
                  ExcalidrawBindableElement["type"],
                  "image" | "text" | "frame" | "embeddable"
                >;
                id?: ExcalidrawGenericElement["id"];
              }
            | {
                id: ExcalidrawGenericElement["id"];
                type?: Exclude<
                  ExcalidrawBindableElement["type"],
                  "image" | "text" | "frame" | "embeddable"
                >;
              }
          )
        | ((
            | {
                type: "text";
                text: string;
              }
            | {
                type?: "text";
                id: ExcalidrawTextElement["id"];
                text: string;
              }
          ) &
            Partial<ExcalidrawTextElement>)
      ) &
        MarkOptional<ElementConstructorOpts, "x" | "y">;
  start?:
    | (
        | (
            | {
                type: Exclude<
                  ExcalidrawBindableElement["type"],
                  "image" | "text" | "frame" | "embeddable"
                >;
                id?: ExcalidrawGenericElement["id"];
              }
            | {
                id: ExcalidrawGenericElement["id"];
                type?: Exclude<
                  ExcalidrawBindableElement["type"],
                  "image" | "text" | "frame" | "embeddable"
                >;
              }
          )
        | ((
            | {
                type: "text";
                text: string;
              }
            | {
                type?: "text";
                id: ExcalidrawTextElement["id"];
                text: string;
              }
          ) &
            Partial<ExcalidrawTextElement>)
      ) &
        MarkOptional<ElementConstructorOpts, "x" | "y">;
} & Partial<ExcalidrawLinearElement>;

export type ValidContainer =
  | {
      type: Exclude<ExcalidrawGenericElement["type"], "selection">;
      id?: ExcalidrawGenericElement["id"];
      label?: {
        text: string;
        fontSize?: number;
        fontFamily?: FontFamilyValues;
        textAlign?: TextAlign;
        verticalAlign?: VerticalAlign;
      } & MarkOptional<ElementConstructorOpts, "x" | "y">;
    } & ElementConstructorOpts;

export type ExcalidrawProgrammaticElement =
  | Extract<
      Exclude<ExcalidrawElement, ExcalidrawSelectionElement>,
      | ExcalidrawEmbeddableElement
      | ExcalidrawFreeDrawElement
      | ExcalidrawFrameElement
    >
  | ({
      type: Extract<ExcalidrawLinearElement["type"], "line">;
      x: number;
      y: number;
    } & Partial<ExcalidrawLinearElement>)
  | ValidContainer
  | ValidLinearElement
  | ({
      type: "text";
      text: string;
      x: number;
      y: number;
      id?: ExcalidrawTextElement["id"];
    } & Partial<ExcalidrawTextElement>)
  | ({
      type: Extract<ExcalidrawImageElement["type"], "image">;
      x: number;
      y: number;
      fileId: FileId;
    } & Partial<ExcalidrawImageElement>);

export interface ExcalidrawProgrammaticAPI {
  elements?: readonly ExcalidrawProgrammaticElement[] | null;
}

const DEFAULT_LINEAR_ELEMENT_PROPS = {
  width: 300,
  height: 0,
};

const DEFAULT_DIMENSION = 100;

const bindTextToContainer = (
  containerProps: ValidContainer | ({ type: "arrow" } & ValidLinearElement),
  textProps: { text: string } & MarkOptional<ElementConstructorOpts, "x" | "y">,
) => {
  let container: ExcalidrawGenericElement | ExcalidrawLinearElement;
  if (containerProps.type === "arrow") {
    const width = containerProps.width || DEFAULT_LINEAR_ELEMENT_PROPS.width;
    const height = containerProps.height || DEFAULT_LINEAR_ELEMENT_PROPS.height;
    container = newLinearElement({
      width,
      height,
      endArrowhead: "arrow",
      points: [
        [0, 0],
        [width, height],
      ],
      ...containerProps,
    });
  } else {
    container = newElement({
      ...containerProps,
    });
  }
  const textElement: ExcalidrawTextElement = newTextElement({
    x: 0,
    y: 0,
    textAlign: TEXT_ALIGN.CENTER,
    verticalAlign: VERTICAL_ALIGN.MIDDLE,
    ...textProps,
    containerId: container.id,
    strokeColor: textProps.strokeColor || container.strokeColor,
  });

  Object.assign(container, {
    boundElements: (container.boundElements || []).concat({
      type: "text",
      id: textElement.id,
    }),
  });

  redrawTextBoundingBox(textElement, container);

  return [container, textElement] as const;
};

const bindLinearElementToElement = (
  linearElement: ValidLinearElement,
  elementStore: ElementStore,
): {
  linearElement: ExcalidrawLinearElement;
  startBoundElement?: ExcalidrawElement;
  endBoundElement?: ExcalidrawElement;
} => {
  const {
    start,
    end,
    type,
    endArrowhead = linearElement.type === "arrow" ? "arrow" : null,
    ...rest
  } = linearElement;
  const width = linearElement.width || DEFAULT_LINEAR_ELEMENT_PROPS.width;
  const height = linearElement.height || DEFAULT_LINEAR_ELEMENT_PROPS.height;
  const excliadrawLinearElement = newLinearElement({
    type,
    width,
    height,
    points: [
      [0, 0],
      [width, height],
    ],
    endArrowhead,
    ...rest,
  });

  let startBoundElement;
  let endBoundElement;

  Object.assign(excliadrawLinearElement, {
    startBinding: linearElement?.startBinding || null,
    endBinding: linearElement.endBinding || null,
  });

  if (start) {
    const width = start?.width ?? DEFAULT_DIMENSION;
    const height = start?.height ?? DEFAULT_DIMENSION;

    let existingElement;
    if (start.id) {
      existingElement = elementStore
        .getElements()
        .find((ele) => ele?.id === start.id) as Exclude<
        ExcalidrawBindableElement,
        | ExcalidrawImageElement
        | ExcalidrawFrameElement
        | ExcalidrawEmbeddableElement
      >;
      if (!existingElement) {
        console.error(`No element for start binding with id ${start.id} found`);
      }
    }

    const startX = start.x || excliadrawLinearElement.x - width;
    const startY = start.y || excliadrawLinearElement.y - height / 2;
    const startType = existingElement ? existingElement.type : start.type;

    if (startType) {
      if (startType === "text") {
        let text = "";
        if (existingElement && existingElement.type === "text") {
          text = existingElement.text;
        } else if (start.type === "text") {
          text = start.text;
        }
        if (!text) {
          console.error(
            `No text found for start binding text element for ${excliadrawLinearElement.id}`,
          );
        }
        startBoundElement = newTextElement({
          x: startX,
          y: startY,
          type: "text",
          ...existingElement,
          ...start,
          text,
        });
        // to position the text correctly when coordinates not provided
        Object.assign(startBoundElement, {
          x: start.x || excliadrawLinearElement.x - startBoundElement.width,
          y:
            start.y || excliadrawLinearElement.y - startBoundElement.height / 2,
        });
      } else {
        startBoundElement = newElement({
          x: startX,
          y: startY,
          width,
          height,
          ...existingElement,
          ...start,
          type: startType,
        });
      }

      bindLinearElement(
        excliadrawLinearElement,
        startBoundElement as ExcalidrawBindableElement,
        "start",
      );
    }
  }
  if (end) {
    const height = end?.height ?? DEFAULT_DIMENSION;
    const width = end?.width ?? DEFAULT_DIMENSION;

    let existingElement;
    if (end.id) {
      existingElement = elementStore
        .getElements()
        .find(
          (
            ele,
          ): ele is Exclude<
            ExcalidrawBindableElement,
            | ExcalidrawImageElement
            | ExcalidrawFrameElement
            | ExcalidrawEmbeddableElement
          > => ele?.id === end.id,
        );
      if (!existingElement) {
        console.error(`No element for end binding with id ${end.id} found`);
      }
    }
    const endX =
      end.x || excliadrawLinearElement.x + excliadrawLinearElement.width;
    const endY = end.y || excliadrawLinearElement.y - height / 2;
    const endType = existingElement ? existingElement.type : end.type;

    if (endType) {
      if (endType === "text") {
        let text = "";
        if (existingElement && existingElement.type === "text") {
          text = existingElement.text;
        } else if (end.type === "text") {
          text = end.text;
        }

        if (!text) {
          console.error(
            `No text found for end binding text element for ${excliadrawLinearElement.id}`,
          );
        }
        endBoundElement = newTextElement({
          x: endX,
          y: endY,
          type: "text",
          ...existingElement,
          ...end,
          text,
        });
        // to position the text correctly when coordinates not provided
        Object.assign(endBoundElement, {
          y: end.y || excliadrawLinearElement.y - endBoundElement.height / 2,
        });
      } else {
        endBoundElement = newElement({
          x: endX,
          y: endY,
          width,
          height,
          ...existingElement,
          ...end,
          type: endType,
        }) as ExcalidrawBindableElement;
      }

      bindLinearElement(
        excliadrawLinearElement,
        endBoundElement as ExcalidrawBindableElement,
        "end",
      );
    }
  }
  return {
    linearElement: excliadrawLinearElement,
    startBoundElement,
    endBoundElement,
  };
};

class ElementStore {
  res: ExcalidrawElement[] = [];
  elementMap = new Map<string, number>();

  add = (ele?: ExcalidrawElement) => {
    if (!ele) {
      return;
    }
    const index = this.elementMap.get(ele.id);
    if (index !== undefined && index >= 0) {
      this.res[index] = ele;
    } else {
      this.res.push(ele);
      const index = this.res.length - 1;
      this.elementMap.set(ele.id, index);
    }
  };
  getElements = () => {
    return this.res;
  };
}

export const convertToExcalidrawElements = (
  elements: ExcalidrawProgrammaticAPI["elements"],
): ExcalidrawElement[] => {
  if (!elements) {
    return [];
  }

  const elementStore = new ElementStore();

  // ensure unique ids
  // ---------------------------------------------------------------------------
  const ids = new Set<ExcalidrawElement["id"]>();
  const elementsWithIds = elements.map((element) => {
    let id = element.id || regenerateId(null);

    // To make sure every element has a unique id since regenerateId appends
    // _copy to the original id and if it exists we need to generate again
    // hence a loop
    while (ids.has(id)) {
      id = regenerateId(id);
    }

    ids.add(id);

    return { ...element, id };
  });
  // ---------------------------------------------------------------------------

  for (const element of elementsWithIds) {
    switch (element.type) {
      case "rectangle":
      case "ellipse":
      case "diamond":
      case "arrow": {
        if (element.label?.text) {
          let [container, text] = bindTextToContainer(
            element as
              | ValidContainer
              | ({
                  type: "arrow";
                } & ValidLinearElement),
            element?.label,
          );
          elementStore.add(container);
          elementStore.add(text);

          if (container.type === "arrow") {
            const originalStart =
              element.type === "arrow" ? element?.start : undefined;
            const originalEnd =
              element.type === "arrow" ? element?.end : undefined;
            const { linearElement, startBoundElement, endBoundElement } =
              bindLinearElementToElement(
                {
                  ...container,
                  start: originalStart,
                  end: originalEnd,
                },
                elementStore,
              );
            container = linearElement;
            elementStore.add(linearElement);
            elementStore.add(startBoundElement);
            elementStore.add(endBoundElement);
          }
        } else {
          switch (element.type) {
            case "arrow": {
              const { linearElement, startBoundElement, endBoundElement } =
                bindLinearElementToElement(element, elementStore);
              elementStore.add(linearElement);
              elementStore.add(startBoundElement);
              elementStore.add(endBoundElement);
              break;
            }
            case "rectangle":
            case "ellipse":
            case "diamond": {
              elementStore.add(
                newElement({
                  ...element,
                  width: element?.width || DEFAULT_DIMENSION,
                  height: element?.height || DEFAULT_DIMENSION,
                }),
              );
              break;
            }
            default: {
              assertNever(
                element.type,
                `Unhandled element type "${element.type}"`,
              );
            }
          }
        }
        break;
      }
      case "line": {
        const width = element.width || DEFAULT_LINEAR_ELEMENT_PROPS.width;
        const height = element.height || DEFAULT_LINEAR_ELEMENT_PROPS.height;
        const lineElement = newLinearElement({
          width,
          height,
          points: [
            [0, 0],
            [width, height],
          ],
          ...element,
        });
        elementStore.add(lineElement);
        break;
      }
      case "text": {
        const fontFamily = element?.fontFamily || DEFAULT_FONT_FAMILY;
        const fontSize = element?.fontSize || DEFAULT_FONT_SIZE;
        const lineHeight =
          element?.lineHeight || getDefaultLineHeight(fontFamily);
        const text = element.text ?? "";
        const normalizedText = normalizeText(text);
        const metrics = measureText(
          normalizedText,
          getFontString({ fontFamily, fontSize }),
          lineHeight,
        );

        const textElement = newTextElement({
          width: metrics.width,
          height: metrics.height,
          fontFamily,
          fontSize,
          ...element,
        });
        elementStore.add(textElement);
        break;
      }
      case "image": {
        const imageElement = newImageElement({
          width: element?.width || DEFAULT_DIMENSION,
          height: element?.height || DEFAULT_DIMENSION,
          ...element,
        });
        elementStore.add(imageElement);
        break;
      }
      case "freedraw":
      case "frame":
      case "embeddable": {
        elementStore.add(element);
        break;
      }
      default: {
        elementStore.add(element);
        assertNever(
          element,
          `Unhandled element type "${(element as any).type}"`,
          true,
        );
      }
    }
  }
  return elementStore.getElements();
};
