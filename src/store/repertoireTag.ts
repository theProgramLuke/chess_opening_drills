import { Side } from "./side";

export class RepertoireTag {
  id: number;
  forSide: Side;
  name: string;
  position: string;
  children: Array<RepertoireTag>;

  constructor(
    id: number,
    forSide: Side,
    name: string,
    position: string,
    children: Array<RepertoireTag>
  ) {
    this.id = id;
    this.forSide = forSide;
    this.name = name;
    this.position = position;
    this.children = children;
  }
}
