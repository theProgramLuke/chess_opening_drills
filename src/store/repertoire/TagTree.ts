import _ from "lodash";
import { Guid } from "guid-typescript";

export class TagTree {
  name: string;
  fen: string;
  id: string;
  children: TagTree[];

  constructor(name: string, fen: string, id: string, children: TagTree[]) {
    this.name = name;
    this.fen = fen;
    this.id = id;
    this.children = children;
  }

  removeTag(fen: string): void {
    _.remove(this.children, child => child.fen === fen);
    _.forEach(this.children, child => child.removeTag(fen));
  }

  addTag(name: string, fen: string): void {
    const child = new TagTree(name, fen, Guid.create().toString(), []);

    this.children.push(child);
  }
}
