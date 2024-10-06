import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

import Container from "./Container";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Container axis="horizontal" tiles={[]} />
    </div>
  );
};

export default App;
