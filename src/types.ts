import { Accessor, Setter } from "solid-js";
import { SetStoreFunction, reconcile } from "solid-js/store";

export type Axis = "horizontal" | "vertical";

export enum DropZone {
  Top,
  Right,
  Bottom,
  Left,
}

export type GhostConfig = {
  tileKey: string;
  dropZone: DropZone;
};

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
  }).filter((child) => child.type !== "container" || child.children.length > 0);

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

const findTileConfig = (
  current: TileContainerConfig,
  tileKey: string
): TileConfig | undefined => {
  const tileConfig = current.children.find(
    (child) => child.type === "tile" && child.key === tileKey
  );

  if (tileConfig) {
    // Cast is safe because we just checked the type above
    return tileConfig as TileConfig;
  }


  for (const child of current.children) {
    if (child.type !== "container") {
      continue;
    }

    const tileConfig = findTileConfig(child, tileKey);
    if (tileConfig) {
      return tileConfig;
    }
  };

  return undefined;
}

const insertRelative = (
  current: TileContainerConfig,
  currentAxis: Axis,
  tileConfig: TileConfig,
  destinationKey: string,
  dropZone: DropZone,
): TileContainerConfig => {
  // TODO: Improve typing below
  const newChildren: (TileContainerConfig | TileConfig)[] = current.children.flatMap((child) => {
    if (child.type === "container") {
      return [insertRelative(child, currentAxis === "horizontal" ? "vertical" : "horizontal", tileConfig, destinationKey, dropZone)];
    } else if (child.key === destinationKey) {
      if (currentAxis === "horizontal") {
        switch (dropZone) {
          case DropZone.Top:
            console.log("horizontal", "top");
            return { type: "container", children: [tileConfig, child] } as TileContainerConfig;
          case DropZone.Bottom:
            console.log("horizontal", "bottom");
            return { type: "container", children: [child, tileConfig] } as TileContainerConfig;
          case DropZone.Left:
            console.log("horizontal", "left");
            return [tileConfig, child] as (TileContainerConfig | TileConfig)[];
          case DropZone.Right:
            console.log("horizontal", "right");
            // TODO: not working
            return [child, tileConfig] as (TileContainerConfig | TileConfig)[];
        }
      } else {
        switch (dropZone) {
          case DropZone.Top:
            console.log("vertical", "top");
            return [tileConfig, child] as (TileContainerConfig | TileConfig)[];
          case DropZone.Bottom:
            console.log("vertical", "bottom");
            return [child, tileConfig] as (TileContainerConfig | TileConfig)[];
          case DropZone.Left:
            console.log("vertical", "left");
            return { type: "container", children: [tileConfig, child] } as TileContainerConfig;
          case DropZone.Right:
            console.log("vertical", "right");
            return { type: "container", children: [child, tileConfig] } as TileContainerConfig;
        }
      }
      return [child];
    } else {
      return [child];
    }
  });

  return { ...current, children: newChildren };
};

export const move = (
  model: TileContainerConfig,
  setModel: SetStoreFunction<TileContainerConfig>,
  rootAxis: Axis,
  sourceKey: string,
  destinationKey: string,
  dropZone: DropZone,

) => {
  const tileConfig = findTileConfig(model, sourceKey);
  if (!tileConfig) {
    return;
  }

  model = innerClose(model, sourceKey);
  model = insertRelative(model, rootAxis, tileConfig, destinationKey, dropZone);
  console.log("move", model);
  setModel(model);
};
