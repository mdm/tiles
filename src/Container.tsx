import { Accessor, Component, For, Match, Setter, Show, Switch, createSignal } from "solid-js";

import Ghost from "./Ghost";
import Tile from "./Tile";
import { Axis, TileContainerConfig, TileConfig, GhostConfig, DropZone } from "./types";

type Props = {
  root: boolean;
  axis: Axis;
  model: TileContainerConfig;
  split: (tileKey: string, splitAxis: Axis) => void;
  close: (tileKey: string) => void;
  ghost: Accessor<GhostConfig | null>;
  setGhost: Setter<GhostConfig | null>;
  move: (sourceKey: string, destinationKey: string, dropZone: DropZone) => void;
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
          <Switch>
            <Match when={child.type === "tile"}>
              <Switch fallback={
                <Tile
                  model={child as TileConfig}
                  close={props.close}
                  split={props.split}
                  ghost={props.ghost}
                  setGhost={props.setGhost}
                  move={props.move}
                  hideEmptyContainer={hideEmptyContainer}
                />
              }>
                <Match when={child.type === "tile" && child.key === props.ghost()?.tileKey && props.axis === "horizontal"}>
                  <Switch>
                    <Match when={props.ghost()?.dropZone === DropZone.Top}>
                      <div class="flex grow shrink-0 flex-col">
                        <Ghost
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                        />
                        <Tile
                          model={child as TileConfig}
                          close={props.close}
                          split={props.split}
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                          hideEmptyContainer={hideEmptyContainer}
                        />
                      </div>
                    </Match>
                    <Match when={props.ghost()?.dropZone === DropZone.Bottom}>
                      <div class="flex grow shrink-0 flex-col">
                        <Tile
                          model={child as TileConfig}
                          close={props.close}
                          split={props.split}
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                          hideEmptyContainer={hideEmptyContainer}
                        />
                        <Ghost
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                        />
                      </div>
                    </Match>
                    <Match when={props.ghost()?.dropZone === DropZone.Left}>
                      <Ghost
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                      />
                      <Tile
                        model={child as TileConfig}
                        close={props.close}
                        split={props.split}
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                        hideEmptyContainer={hideEmptyContainer}
                      />
                    </Match>
                    <Match when={props.ghost()?.dropZone === DropZone.Right}>
                      <Tile
                        model={child as TileConfig}
                        close={props.close}
                        split={props.split}
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                        hideEmptyContainer={hideEmptyContainer}
                      />
                      <Ghost
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                      />
                    </Match>
                  </Switch>
                </Match>
                <Match when={child.type === "tile" && child.key === props.ghost()?.tileKey && props.axis === "vertical"}>
                  <Switch>
                    <Match when={props.ghost()?.dropZone === DropZone.Top}>
                      <Ghost
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                      />
                      <Tile
                        model={child as TileConfig}
                        close={props.close}
                        split={props.split}
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                        hideEmptyContainer={hideEmptyContainer}
                      />
                    </Match>
                    <Match when={props.ghost()?.dropZone === DropZone.Bottom}>
                      <Tile
                        model={child as TileConfig}
                        close={props.close}
                        split={props.split}
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                        hideEmptyContainer={hideEmptyContainer}
                      />
                      <Ghost
                        ghost={props.ghost}
                        setGhost={props.setGhost}
                        move={props.move}
                      />
                    </Match>
                    <Match when={props.ghost()?.dropZone === DropZone.Left}>
                      <div class="flex grow shrink-0 border border-blue-600">
                        <Ghost
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                        />
                        <Tile
                          model={child as TileConfig}
                          close={props.close}
                          split={props.split}
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                          hideEmptyContainer={hideEmptyContainer}
                        />
                      </div>
                    </Match>
                    <Match when={props.ghost()?.dropZone === DropZone.Right}>
                      <div class="flex grow shrink-0 border border-blue-600">
                        <Tile
                          model={child as TileConfig}
                          close={props.close}
                          split={props.split}
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                          hideEmptyContainer={hideEmptyContainer}
                        />
                        <Ghost
                          ghost={props.ghost}
                          setGhost={props.setGhost}
                          move={props.move}
                        />
                      </div>
                    </Match>
                  </Switch>
                </Match>
              </Switch>
            </Match>
            <Match when={child.type === "container"}>
              <Container
                root={false}
                axis={props.axis === "horizontal" ? "vertical" : "horizontal"}
                model={child as TileContainerConfig}
                close={props.close}
                split={props.split}
                ghost={props.ghost}
                setGhost={props.setGhost}
                move={props.move}
              />
            </Match>
          </Switch>
        )}
      </For>
    </div>
  );
};

export default Container;
