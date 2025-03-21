import { Accessor, Component, Setter } from "solid-js";
import { DropZone, GhostConfig } from "./types";

type Props = {
  ghost: Accessor<GhostConfig | null>;
  setGhost: Setter<GhostConfig | null>;
  move: (sourceKey: string, destinationKey: string, dropZone: DropZone) => void;
};

const Ghost: Component<Props> = (props: Props) => {
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent) => {
    console.log("drop on ghost");
    if (!props.ghost()) {
      return;
    }

    const sourceKey = event.dataTransfer!.getData("text/plain");
    const destinationKey = props.ghost()!.tileKey;
    const dropZone = props.ghost()!.dropZone;
    props.setGhost(null);

    props.move(sourceKey, destinationKey, dropZone);
  };

  return (
    <div class="grow shrink-0 p-2" ondragover={handleDragOver} ondrop={handleDrop}>
      <div
        class="h-full min-h-20 bg-gray-400 border rounded-md border-gray-400"
      ></div>
    </div>
  );
};

export default Ghost;
