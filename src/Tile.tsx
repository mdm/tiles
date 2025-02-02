import { Component, createSignal, Show } from "solid-js";

import { Axis, TileConfig } from "./types";

type Props = {
  model: TileConfig;
  split: (tileKey: string, splitAxis: Axis) => void;
  close: (tileKey: string) => void;
};

enum DropZone {
  None,
  Top,
  Right,
  Bottom,
  Left,
}

const Tile: Component<Props> = (props: Props) => {
  const [dragging, setDragging] = createSignal(false);
  const [activeDropZone, setActiveDropZone] = createSignal<DropZone>(DropZone.None);

  const handleDragStart = (event: DragEvent) => {
    console.log("drag start", props.model.key);
    event.dataTransfer!.setData("text/plain", props.model.key);
    event.dataTransfer!.effectAllowed = "move";
    setDragging(true);
  };

  const calculateDropZone = (event: DragEvent): DropZone => {
    const targetTop = (event.currentTarget! as Element).getBoundingClientRect().top;
    const targetRight = (event.currentTarget! as Element).getBoundingClientRect().right;
    const targetBottom = (event.currentTarget! as Element).getBoundingClientRect().bottom;
    const targetLeft = (event.currentTarget! as Element).getBoundingClientRect().left;

    const targetHalfWidth = (targetRight - targetLeft) / 2;
    const targetHalfHeight = (targetBottom - targetTop) / 2;

    const centerX = targetLeft + targetHalfWidth;
    const centerY = targetTop + targetHalfHeight;

    const distanceX = event.clientX - centerX;
    const distanceY = event.clientY - centerY;

    console.log(distanceX, distanceY);

    if (distanceX === 0 || Math.abs(distanceY / distanceX) > targetHalfHeight / targetHalfWidth) {
      if (distanceY <= 0) {
        console.log("top", props.model.key);
        return DropZone.Top;
      } else {

        console.log("bottom", props.model.key);
        return DropZone.Bottom;
      }
    } else {
      if (distanceX <= 0) {
        console.log("left", props.model.key);
        return DropZone.Left;
      } else {

        console.log("right", props.model.key);
        return DropZone.Right;
      }
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
    setActiveDropZone(calculateDropZone(event));
  };

  const handleDragLeave = (_event: DragEvent) => {
    setActiveDropZone(DropZone.None);
  };

  const handleDrop = (_event: DragEvent) => {
    // TODO: move the tile

    setActiveDropZone(DropZone.None);
  };

  return (
    <div
      class={
        "grow shrink-0 m-2 flex"
        + (activeDropZone() === DropZone.Left || activeDropZone() === DropZone.Right ? "" : " flex-col")
        + (dragging() ? " hidden" : "")
      }
      draggable="true"
      ondragstart={handleDragStart}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
    >
      <Show when={activeDropZone() === DropZone.Top || activeDropZone() === DropZone.Left}>
        <div class="border border-red-600"></div>
      </Show>
      <div class="h-full grow shadow-lg border rounded-md border-gray-200">
        <div>
          <button
            title="Split horizontally"
            onClick={() => props.split(props.model.key, "horizontal")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M200-200v-160 4-4 160Zm0 80q-33 0-56.5-23.5T120-200v-160q0-33 23.5-56.5T200-440h560q33 0 56.5 23.5T840-360H200v160h400v80H200Zm0-400q-33 0-56.5-23.5T120-600v-160q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v160q0 33-23.5 56.5T760-520H200Zm0-80h560v-160H200v160Zm0 0v-160 160ZM760-40v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
            </svg>
          </button>
          <button
            title="Split vertically"
            onClick={() => props.split(props.model.key, "vertical")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M760-760H599h5-4 160Zm-240 0q0-33 23.5-56.5T600-840h160q33 0 56.5 23.5T840-760v400h-80v-400H600v640q-33 0-56.5-23.5T520-200v-560ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h160q33 0 56.5 23.5T440-760v560q0 33-23.5 56.5T360-120H200Zm160-640H200v560h160v-560Zm0 0H200h160ZM760-40v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
            </svg>
          </button>
          <button title="Close" onClick={() => props.close(props.model.key)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </button>
        </div>
      </div>
      <Show when={activeDropZone() === DropZone.Bottom || activeDropZone() === DropZone.Right}>
        <div class="border border-red-600"></div>
      </Show>
    </div>
  );
};

export default Tile;
