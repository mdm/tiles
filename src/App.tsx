import { children, type Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

import Container from "./Container";
import { ContainerConfig } from "./types";

const App: Component = () => {
  const config: ContainerConfig = {
    type: "container",
    children: [
      { type: "tile", props: {} },
      {
        type: "container",
        children: [
          { type: "tile", props: {} },
          { type: "tile", props: {} },
        ],
      },
      { type: "tile", props: {} },
    ],
  };

  return (
    <div class={styles.App}>
      <Container root={true} axis="horizontal" config={config} />
    </div>
  );
};

export default App;
