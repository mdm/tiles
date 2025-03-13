import { Accessor, Setter } from "solid-js";
import { SetStoreFunction, reconcile } from "solid-js/store";

export type Axis = "horizontal" | "vertical";

export enum DropZone {
  None,
  Top,
  Right,
  Bottom,
  Left,
}

export type TileContainerConfig = {
  type: "container";
  children: (TileContainerConfig | TileConfig)[];
};

export type TileConfig = {
  type: "tile";
  key: string;
  ghost: boolean;
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
  splitAxis: Axis
) => {
  console.log("enter split", model, rootAxis, tileKey, splitAxis);
  setModel(innerSplit(model, rootAxis, tileKey, splitAxis));
  console.log("leave split", model, rootAxis, tileKey, splitAxis);
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

const innerReplaceGost = (
  current: TileContainerConfig,
  tileConfig: TileConfig,
  ghostKey: string): TileContainerConfig => {
  const newChildren = current.children.map((child) => {
    if (child.type === "container") {
      return innerReplaceGost(child, tileConfig, ghostKey);
    } else if (child.key === ghostKey) {
      return tileConfig;

    } else {
      return child;
    }
  });

  return { ...current, children: newChildren };
};

export const replaceGhost = (
  model: TileContainerConfig,
  setModel: SetStoreFunction<TileContainerConfig>,
  sourceKey: string,
) => {
  const tileConfig = findTileConfig(model, sourceKey);
  if (!tileConfig) {
    return;
  }
  model = innerClose(model, sourceKey);

  const ghostKey = findGhostKey(model);
  if (!ghostKey) {
    return;
  }

  setModel(innerReplaceGost(model, tileConfig, ghostKey));
};

const findGhostKey = (
  current: TileContainerConfig,
): string | undefined => {
  for (const child of current.children) {
    if (child.type === "container") {
      const result = findGhostKey(child);
      if (result) {
        return result;
      }
    }
    if (child.type === "tile" && child.ghost) {
      return child.key;
    }
  }

  return undefined;
};

const innerInsertGhost = (
  current: TileContainerConfig,
  currentAxis: Axis,
  ghostConfig: TileConfig,
  tileKey: string,
  dropZone: DropZone
): TileContainerConfig => {
  const newChildren: (TileContainerConfig | TileConfig)[] = current.children.map((child) => {
    if (child.type === "container") {
      const childAxis = currentAxis === "horizontal" ? "vertical" : "horizontal";
      return innerInsertGhost(child, childAxis, ghostConfig, tileKey, dropZone);
    } else if (child.key === tileKey) {
      if (currentAxis === "horizontal") {
        switch (dropZone) {
          case DropZone.Top:
            return {
              type: "container",
              children: [ghostConfig, child],
            };
          case DropZone.Bottom:
            return {
              type: "container",
              children: [child, ghostConfig],
            };
          default:
            return child;
        }
      } else {
        switch (dropZone) {
          case DropZone.Left:
            return {
              type: "container",
              children: [ghostConfig, child],
            };
          case DropZone.Right:
            return {
              type: "container",
              children: [child, ghostConfig],
            };
          default:
            return child;
        }
      }
    } else {
      return child;
    }
  });

  return { ...current, children: newChildren };
}

export const insertGhost = (
  model: TileContainerConfig,
  setModel: SetStoreFunction<TileContainerConfig>,
  rootAxis: Axis,
  tileKey: string,
  dropZone: DropZone
) => {
  let ghostKey = findGhostKey(model);
  while (ghostKey) {
    model = innerClose(model, ghostKey);
    ghostKey = findGhostKey(model);
  }

  const ghostTile: TileConfig = {
    type: "tile",
    key: crypto.randomUUID(),
    ghost: true,
    props: {},
  };

  setModel(innerInsertGhost(model, rootAxis, ghostTile, tileKey, dropZone));
}
