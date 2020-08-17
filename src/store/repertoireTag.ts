import _ from "lodash";
import { Side } from "./side";
import { FEN } from "chessground/types";
import { RepertoirePosition } from "./repertoirePosition";

export class SavedRepertoireTag {
  id: number;
  forSide: Side;
  name: string;
  positionId: number;
  fen: FEN;
  children: SavedRepertoireTag[];

  constructor(
    id: number,
    forSide: Side,
    name: string,
    positionId: number,
    fen: FEN,
    children: SavedRepertoireTag[]
  ) {
    this.id = id;
    this.forSide = forSide;
    this.name = name;
    this.positionId = positionId;
    this.fen = fen;
    this.children = children;
  }
}

export class RepertoireTag {
  id: number;
  forSide: Side;
  name: string;
  position: RepertoirePosition;
  fen: FEN;
  children: RepertoireTag[];

  constructor(
    id: number,
    forSide: Side,
    name: string,
    position: RepertoirePosition,
    fen: FEN,
    children: RepertoireTag[]
  ) {
    this.id = id;
    this.forSide = forSide;
    this.name = name;
    this.position = position;
    this.fen = fen;
    this.children = children;
  }

  AddChild(tag: RepertoireTag) {
    this.children.push(tag);
  }

  RemoveChild(tag: RepertoireTag) {
    const childIndex = _.indexOf(this.children, tag);
    if (childIndex !== -1) {
      this.children.splice(childIndex);
    } else {
      _.forEach(this.children, child => child.RemoveChild(tag));
    }
  }

  GetMaxId(): number {
    const ids = [this.id];
    ids.push(..._.map(this.children, child => child.GetMaxId()));
    return _.max(ids) || -1;
  }

  AsSaved(positionSource: RepertoirePosition[]): SavedRepertoireTag {
    const children = _.map(this.children, child =>
      child.AsSaved(positionSource)
    );

    return new SavedRepertoireTag(
      this.id,
      this.forSide,
      this.name,
      _.indexOf(positionSource, this.position),
      this.fen,
      children
    );
  }

  static FromSaved(
    saved: SavedRepertoireTag,
    positionSource: RepertoirePosition[]
  ): RepertoireTag {
    const children = _.map(saved.children, child =>
      RepertoireTag.FromSaved(child, positionSource)
    );

    return new RepertoireTag(
      saved.id,
      saved.forSide,
      saved.name,
      positionSource[saved.positionId],
      saved.fen,
      children
    );
  }
}
