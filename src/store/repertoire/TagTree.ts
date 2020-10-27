import _ from "lodash";
import { Guid } from "guid-typescript";

export interface SavedTagTree {
  name: string;
  fen: string;
  id: string;
  isRootTag: boolean;
  children: SavedTagTree[];
}

export class TagTree {
  name: string;
  fen: string;
  id: string;
  isRootTag: boolean;
  children: TagTree[];

  constructor(
    name: string,
    fen: string,
    children: TagTree[],
    isRootTag = false,
    id?: string
  ) {
    this.name = name;
    this.fen = fen;
    this.id = id || Guid.create().toString();
    this.children = children;
    this.isRootTag = isRootTag;
  }

  removeTag(fen: string): void {
    _.remove(this.children, child => child.fen === fen);
    _.forEach(this.children, child => child.removeTag(fen));
  }

  addTag(name: string, fen: string): void {
    const child = new TagTree(name, fen, []);

    this.children.push(child);
  }

  asSaved(): SavedTagTree {
    return {
      name: this.name,
      fen: this.fen,
      id: this.id,
      children: _.map(this.children, child => child.asSaved()),
      isRootTag: this.isRootTag
    };
  }

  static fromSaved(saved: SavedTagTree): TagTree {
    return new TagTree(
      saved.name,
      saved.fen,
      _.map(saved.children, TagTree.fromSaved),
      saved.isRootTag,
      saved.id
    );
  }
}
