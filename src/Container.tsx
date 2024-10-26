import { Component, createSignal, For, JSXElement } from "solid-js";

import Tile from "./Tile";
import { Axis } from "./types";
import { k } from "vite/dist/node/types.d-aGj9QkWt";

type Props = {
  root: boolean;
  axis: Axis;
  tiles: number;
  close?: () => void;
};

const Container: Component<Props> = (props: Props) => {
  const makeTile = (
    close: (key: string) => void,
    split: (key: string, axis: Axis) => void
  ) => {
    const newKey = crypto.randomUUID();
    return [
      newKey,
      <Tile
        close={close.bind(undefined, newKey)}
        split={split.bind(undefined, newKey)}
      />,
    ];
  };

  const makeContainer = (close: (key: string) => void) => {
    const newAxis = props.axis === "horizontal" ? "vertical" : "horizontal";
    const newKey = crypto.randomUUID();
    return [
      newKey,
      <Container
        root={false}
        axis={newAxis}
        tiles={2}
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

  const split = (key: string, axis: Axis) => {
    if (axis === props.axis) {
      setTiles(
        tiles().map((tile) => {
          if (tile[0] === key) {
            return makeContainer(close);
          } else {
            return tile;
          }
        })
      );
    } else {
      setTiles([...tiles(), makeTile(close, split)]);
    }
  };

  const [tiles, setTiles] = createSignal([makeTile(close, split)]);
  for (let i = 1; i < props.tiles; i++) {
    setTiles([...tiles(), makeTile(close, split)]);
  }

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
