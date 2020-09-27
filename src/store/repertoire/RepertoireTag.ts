import _ from "lodash";
import { Guid } from "guid-typescript";

export interface RepertoireTag {
  name: string;
  fen: string;
  id: string;
  children: RepertoireTag[];
}

export function removeTag(tag: RepertoireTag, id: string): void {
  _.remove(tag.children, child => child.id === id);
  _.forEach(tag.children, child => removeTag(child, id));
}

export function addTag(
  tag: RepertoireTag,
  parentId: string,
  name: string,
  fen: string
): void {
  if (tag.id === parentId) {
    tag.children.push({
      name,
      fen,
      id: Guid.create().toString(),
      children: []
    });
  }
  _.forEach(tag.children, child => addTag(child, parentId, name, fen));
}
