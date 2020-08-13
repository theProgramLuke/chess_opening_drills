export class RepertoireTag {
  id: number;
  name: string;
  position: string;
  children: Array<RepertoireTag>;

  constructor(
    id: number,
    name: string,
    position: string,
    children: Array<RepertoireTag>
  ) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.children = children;
  }
}
