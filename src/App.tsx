import { createSignal, type Component } from "solid-js";
import { createStore } from "solid-js/store";

import styles from "./App.module.css";

import Container from "./Container";
import { TileContainerConfig, TileConfig, split, close, insertGhost, replaceGhost, hideTile } from "./types";

const App: Component = () => {
  const [model, setModel] = createStore<TileContainerConfig>({
    type: "container",
    children: [
      // TODO: add helper to construct tiles
      { type: "tile", key: crypto.randomUUID(), ghost: false, hidden: false, props: {} },
      {
        type: "container",
        children: [
          { type: "tile", key: crypto.randomUUID(), ghost: false, hidden: false, props: {} },
          { type: "tile", key: crypto.randomUUID(), ghost: false, hidden: false, props: {} },
        ],
      },
      { type: "tile", key: crypto.randomUUID(), ghost: false, hidden: false, props: {} },
    ],
  });

  const boundSplit = split.bind(undefined, model, setModel, "horizontal");
  const boundClose = close.bind(undefined, model, setModel);
  const boundInsertGhost = insertGhost.bind(undefined, model, setModel, "horizontal");
  const boundReplaceGhost = replaceGhost.bind(undefined, model, setModel);
  const boundHideTile = hideTile.bind(undefined, model, setModel);

  return (
    <div class={styles.App}>
      <Container
        root={true}
        axis="horizontal"
        model={model}
        split={boundSplit}
        close={boundClose}
        insertGhost={boundInsertGhost}
        replaceGhost={boundReplaceGhost}
        hideTile={boundHideTile}
      />
    </div>
  );
};

export default App;
