import { createSignal, type Component } from "solid-js";
import { createStore } from "solid-js/store";

import styles from "./App.module.css";

import Container from "./Container";
import { TileContainerConfig, split, close, GhostConfig, move } from "./types";

const App: Component = () => {
  const [ghost, setGhost] = createSignal<GhostConfig | null>(null)
  const [model, setModel] = createStore<TileContainerConfig>({
    type: "container",
    children: [
      { type: "tile", key: crypto.randomUUID(), props: {} },
      {
        type: "container",
        children: [
          { type: "tile", key: crypto.randomUUID(), props: {} },
          { type: "tile", key: crypto.randomUUID(), props: {} },
        ],
      },
      { type: "tile", key: crypto.randomUUID(), props: {} },
    ],
  });

  const boundSplit = split.bind(undefined, model, setModel, "horizontal");
  const boundClose = close.bind(undefined, model, setModel);
  const boundMove = move.bind(undefined, model, setModel, "horizontal");

  return (
    <div class={styles.App}>
      <Container
        root={true}
        axis="horizontal"
        model={model}
        split={boundSplit}
        close={boundClose}
        ghost={ghost}
        setGhost={setGhost}
        move={boundMove}
      />
    </div>
  );
};

export default App;
