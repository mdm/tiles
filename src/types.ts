export type Axis = "horizontal" | "vertical";

export type ContainerConfig = {
  type: "container";
  children: (ContainerConfig | TileConfig)[];
};

export type TileConfig = {
  type: "tile";
  props: any; // TODO: give this a better type
};
