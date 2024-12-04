import { Accessor, Setter } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

export type Axis = "horizontal" | "vertical";

export type TileContainerConfig = {
  type: "container";
  children: (TileContainerConfig | TileConfig)[];
};

export type TileConfig = {
  type: "tile";
  key: string;
  props: any; // TODO: give this a better type
};

const insertAfter = (
  children: (TileContainerConfig | TileConfig)[],
  tileKey: string
) => {
  const i = children.findIndex(
    (child) => child.type === "tile" && child.key === tileKey
  );
  if (i === -1) {
    return children;
  }
  return [
    ...children.slice(0, i + 1),
    { ...children[i], key: crypto.randomUUID() },
    ...children.slice(i + 1),
  ];
};

const innerSplit = (
  current: TileContainerConfig,
  currentAxis: Axis,
  tileKey: string,
  splitAxis: Axis
) => {
  const oldTileIndex = current.children.findIndex(
    (child) => child.type === "tile" && child.key === tileKey
  );
  if (oldTileIndex !== -1) {
    const oldTile = current.children[oldTileIndex];
    const newTile = { ...oldTile, key: crypto.randomUUID() };

    if (splitAxis === currentAxis) {
      current.children = current.children.map((child) => {
        if (child.type === "tile" && child.key === tileKey) {
          return {
            type: "container",
            children: [oldTile, newTile],
          };
        } else {
          return child;
        }
      });
    } else {
      current.children = insertAfter(current.children, tileKey);
    }

    return;
  }

  // Tile not found. Recurse into children.
  for (const child of current.children) {
    if (child.type === "container") {
      innerSplit(
        child,
        currentAxis === "horizontal" ? "vertical" : "horizontal",
        tileKey,
        splitAxis
      );
    }
  }
};

export const split = (
  model: TileContainerConfig,
  setModel: SetStoreFunction<TileContainerConfig>,
  rootAxis: Axis,
  tileKey: string,
  tileAxis: Axis
) => {
  console.log("enter split", model, rootAxis, tileKey, tileAxis);
  innerSplit(model, rootAxis, tileKey, tileAxis);
  setModel(model);
  console.log("leave split", model, rootAxis, tileKey, tileAxis);
};

const innerClose = (current: TileContainerConfig, tileKey: string) => {
  const i = current.children.findIndex(
    (child) => child.type === "tile" && child.key === tileKey
  );
  if (i !== -1) {
    current.children.splice(i, 1);
    return;
  }

  // Tile not found. Recurse into children.
  for (const child of current.children) {
    if (child.type === "container") {
      innerClose(child, tileKey);
    }
  }
};

export const close = (
  model: TileContainerConfig,
  setModel: SetStoreFunction<TileContainerConfig>,
  tileKey: string
) => {
  console.log("enter close", model, tileKey);
  innerClose(model, tileKey);
  setModel(model);
  console.log("leave close", model, tileKey);
};
