import { Component, For, Show, createSignal } from "solid-js";

import Tile from "./Tile";
import { Axis, TileContainerConfig, TileConfig, DropZone } from "./types";

type Props = {
  root: boolean;
  axis: Axis;
  model: TileContainerConfig;
  split: (tileKey: string, splitAxis: Axis) => void;
  close: (tileKey: string) => void;
  insertGhost: (tileKey: string, dropZone: DropZone) => void;
  replaceGhost: (tileKey: string) => void;
  hideTile: (tileKey: string) => void;
};

const Container: Component<Props> = (props: Props) => {
  const [hidden, setHidden] = createSignal(false);

  const hideEmptyContainer = () => {
    if (props.model.children.length === 1) {
      setHidden(true);
    }
  }

  return (
    <div
      class={
        "flex" +
        (props.root ? "" : " grow shrink-0") +
        (props.axis === "horizontal" ? "" : " flex-col") +
        (hidden() ? " hidden" : "")
      }
    >
      <For each={props.model.children}>
        {(child) => (
          <>
            <Show when={child.type === "tile"}>
              <Tile
                model={child as TileConfig}
                close={props.close}
                split={props.split}
                hideEmptyContainer={hideEmptyContainer}
                insertGhost={props.insertGhost}
                replaceGhost={props.replaceGhost}
                hideTile={props.hideTile}
              />
            </Show>
            <Show when={child.type === "container"}>
              <Container
                root={false}
                axis={props.axis === "horizontal" ? "vertical" : "horizontal"}
                model={child as TileContainerConfig}
                close={props.close}
                split={props.split}
                insertGhost={props.insertGhost}
                replaceGhost={props.replaceGhost}
                hideTile={props.hideTile}
              />
            </Show>
          </>
        )}
      </For>
    </div>
  );
};

export default Container;
