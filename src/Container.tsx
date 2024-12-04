import { Component, For, Show } from "solid-js";

import Tile from "./Tile";
import { Axis, TileContainerConfig, TileConfig } from "./types";

type Props = {
  root: boolean;
  axis: Axis;
  model: TileContainerConfig;
  split: (tileKey: string, splitAxis: Axis) => void;
  close: (tileKey: string) => void;
};

const Container: Component<Props> = (props: Props) => {
  return (
    <div
      class={
        "flex" +
        (props.root ? "" : " grow shrink-0") +
        (props.axis === "horizontal" ? "" : " flex-col")
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
              />
            </Show>
            <Show when={child.type === "container"}>
              <Container
                root={false}
                axis={props.axis === "horizontal" ? "vertical" : "horizontal"}
                model={child as TileContainerConfig}
                close={props.close}
                split={props.split}
              />
            </Show>
          </>
        )}
      </For>
    </div>
  );
};

export default Container;
