import _ from "lodash";
import { Guid } from "guid-typescript";

export interface SavedTagTree {
  name: string;
  fen: string;
  id: string;
  children: SavedTagTree[];
}

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

  asSaved(): SavedTagTree {
    return {
      name: this.name,
      fen: this.fen,
      id: this.id,
      children: _.map(this.children, child => child.asSaved())
    };
  }

  static fromSaved(saved: SavedTagTree): TagTree {
    return new TagTree(
      saved.name,
      saved.fen,
      saved.id,
      _.map(saved.children, TagTree.fromSaved)
    );
  }
}
