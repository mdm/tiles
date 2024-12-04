import { type Component } from "solid-js";
import { createStore } from "solid-js/store";

import styles from "./App.module.css";

import Container from "./Container";
import { TileContainerConfig, split, close } from "./types";

const App: Component = () => {
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

  return (
    <div class={styles.App}>
      <Container
        root={true}
        axis="horizontal"
        model={model}
        split={boundSplit}
        close={boundClose}
      />
    </div>
  );
};

export default App;
