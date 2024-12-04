import { Accessor, Setter } from "solid-js";
import { SetStoreFunction, reconcile } from "solid-js/store";

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
): TileContainerConfig => {
  const oldTileIndex = current.children.findIndex(
    (child) => child.type === "tile" && child.key === tileKey
  );
  if (oldTileIndex !== -1) {
    const oldTile = current.children[oldTileIndex];
    const newTile = { ...oldTile, key: crypto.randomUUID() };

    let newChildren: (TileContainerConfig | TileConfig)[];
    if (splitAxis === currentAxis) {
      newChildren = current.children.map((child) => {
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
      newChildren = insertAfter(current.children, tileKey);
    }

    return { ...current, children: newChildren };
  }

  // Tile not found. Recurse into children.
  const newChildren = current.children.map((child) => {
    if (child.type === "container") {
      return innerSplit(
        child,
        currentAxis === "horizontal" ? "vertical" : "horizontal",
        tileKey,
        splitAxis
      );
    } else {
      return child;
    }
  });

  return { ...current, children: newChildren };
};

export const split = (
  model: TileContainerConfig,
  setModel: SetStoreFunction<TileContainerConfig>,
  rootAxis: Axis,
  tileKey: string,
  tileAxis: Axis
) => {
  console.log("enter split", model, rootAxis, tileKey, tileAxis);
  setModel(innerSplit(model, rootAxis, tileKey, tileAxis));
  console.log("leave split", model, rootAxis, tileKey, tileAxis);
};

const innerClose = (
  current: TileContainerConfig,
  tileKey: string
): TileContainerConfig => {
  const i = current.children.findIndex(
    (child) => child.type === "tile" && child.key === tileKey
  );
  if (i !== -1) {
    const newChildren = current.children.filter(
      (child) => child.type !== "tile" || child.key !== tileKey
    );

    return { ...current, children: newChildren };
  }

  // Tile not found. Recurse into children.
  const newChildren = current.children.map((child) => {
    if (child.type === "container") {
      return innerClose(child, tileKey);
    } else {
      return child;
    }
  });

  return { ...current, children: newChildren };
};

export const close = (
  model: TileContainerConfig,
  setModel: SetStoreFunction<TileContainerConfig>,
  tileKey: string
) => {
  console.log("enter close", model, tileKey);
  setModel(innerClose(model, tileKey));
  console.log("leave close", model, tileKey);
};
