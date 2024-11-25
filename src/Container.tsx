import { children, Component, createSignal, For, JSXElement } from "solid-js";

import Tile from "./Tile";
import { Axis, ContainerConfig, TileConfig } from "./types";
import { k } from "vite/dist/node/types.d-aGj9QkWt";

type Props = {
  root: boolean;
  axis: Axis;
  config: ContainerConfig;
  close?: () => void;
};

const Container: Component<Props> = (props: Props) => {
  const makeTile = (
    config: TileConfig,
    close: (key: string) => void,
    split: (key: string, axis: Axis) => void
  ): [string, JSXElement] => {
    const newKey = crypto.randomUUID();
    return [
      newKey,
      <Tile
        close={close.bind(undefined, newKey)}
        split={split.bind(undefined, newKey)}
        {...config.props}
      />,
    ];
  };

  const makeContainer = (
    config: ContainerConfig,
    close: (key: string) => void
  ): [string, JSXElement] => {
    const newAxis = props.axis === "horizontal" ? "vertical" : "horizontal";
    const newKey = crypto.randomUUID();
    return [
      newKey,
      <Container
        root={false}
        axis={newAxis}
        config={config}
        close={close.bind(undefined, newKey)}
      />,
    ];
  };

  const close = (key: string) => {
    setTiles(tiles().filter((tile) => tile[0] !== key));
    if (tiles().length === 0 && props.close) {
      props.close();
    }
  };

  const insertAfter = (key: string) => {
    const i = tiles().findIndex((tile) => tile[0] === key);
    if (i === -1 || props.config.children[i].type === "container") {
      return tiles();
    }
    return [
      ...tiles().slice(0, i + 1),
      makeTile(props.config.children[i], close, split),
      ...tiles().slice(i + 1),
    ];
  };

  const split = (key: string, axis: Axis) => {
    if (axis === props.axis) {
      setTiles(
        tiles().map((tile, i) => {
          if (tile[0] === key) {
            return makeContainer(
              {
                type: "container",
                children: [props.config.children[i], props.config.children[i]],
              },
              close
            );
          } else {
            return tile;
          }
        })
      );
    } else {
      setTiles(insertAfter(key));
    }
  };

  const [tiles, setTiles] = createSignal(
    props.config.children.map((config, i) => {
      if (config.type === "container") {
        return makeContainer(config, close);
      } else {
        return makeTile(config, close, split);
      }
    })
  );

  return (
    <div
      class={
        "flex" +
        (props.root ? "" : " grow shrink-0") +
        (props.axis === "horizontal" ? "" : " flex-col")
      }
    >
      <For each={tiles()}>{(tile) => tile[1]}</For>
    </div>
  );
};

export default Container;
