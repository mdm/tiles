import { Component, createSignal, For, JSXElement } from "solid-js";

import Tile from "./Tile";
import { Axis } from "./types";
import { k } from "vite/dist/node/types.d-aGj9QkWt";

type Props = {
  axis: Axis;
  tiles: JSXElement[];
};

const Container: Component<Props> = (props: Props) => {
  const newTile = (
    close: (key: string) => void,
    split: (axis: Axis) => void
  ) => {
    const newKey = crypto.randomUUID();
    return [
      newKey,
      <Tile close={close.bind(undefined, newKey)} split={split} />,
    ];
  };

  const [tiles, setTiles] = createSignal(
    props.tiles.map((tile) => [crypto.randomUUID(), tile])
  );

  const close = (key: string) => {
    setTiles(tiles().filter((tile) => tile[0] !== key));
  };

  const split = (axis: Axis) => {
    if (axis === props.axis) {
    } else {
      setTiles([...tiles(), newTile(close, split)]);
    }
  };

  setTiles([...tiles(), newTile(close, split)]);

  return (
    <div class="w-screen h-screen flex">
      <For each={tiles()}>{(tile) => tile[1]}</For>
    </div>
  );
};

export default Container;
