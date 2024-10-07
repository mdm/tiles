import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

import Container from "./Container";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Container root={true} axis="horizontal" tiles={1} />
    </div>
  );
};

export default App;
