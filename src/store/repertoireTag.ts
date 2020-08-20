import _ from "lodash";
import { Guid } from "guid-typescript";

import { Side } from "./side";
import { FEN } from "chessground/types";
import { RepertoirePosition } from "./repertoirePosition";
import { Turn } from "./turn";
import { TrainingMode } from "./trainingMode";
import { Move } from "./move";

export class SavedRepertoireTag {
  id: string;
  forSide: Side;
  name: string;
  positionId: number;
  fen: FEN;
  children: SavedRepertoireTag[];

  constructor(
    forSide: Side,
    name: string,
    positionId: number,
    fen: FEN,
    children: SavedRepertoireTag[],
    id: string
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
  forSide: Side;
  name: string;
  position: RepertoirePosition;
  fen: FEN;
  children: RepertoireTag[];
  id: string;

  constructor(
    forSide: Side,
    name: string,
    position: RepertoirePosition,
    fen: FEN,
    children: RepertoireTag[],
    id?: string
  ) {
    this.id = id || Guid.create().toString();
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

  AsSaved(positionSource: RepertoirePosition[]): SavedRepertoireTag {
    const children = _.map(this.children, child =>
      child.AsSaved(positionSource)
    );

    return new SavedRepertoireTag(
      this.forSide,
      this.name,
      _.indexOf(positionSource, this.position),
      this.fen,
      children,
      this.id.toString()
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
      saved.forSide,
      saved.name,
      positionSource[saved.positionId],
      saved.fen,
      children,
      saved.id
    );
  }
}

export function GetTrainingPositions(
  modes: TrainingMode[],
  tags: RepertoireTag[]
): RepertoirePosition[] {
  const positions: RepertoirePosition[] = [];

  _.forEach(tags, tag => {
    tag.position.VisitChildren((position: RepertoirePosition) => {
      const anyChildren = !_.isEmpty(position.children);
      const modesMatch = !_.isEmpty(
        _.intersection(position.trainingModes, modes)
      );
      if (position.myTurn && anyChildren && modesMatch) {
        positions.push(position);
      }
    });
  });

  return positions;
}

export function GetTrainingMoveLists(
  modes: TrainingMode[],
  tags: RepertoireTag[]
): Move[][] {
  const moveLists: Move[][] = [];
  const parents = GetTrainingPositions(modes, tags);

  _.forEach(parents, parent =>
    moveLists.push(...parent.children[0].position.RootPaths())
  );

  // TODO remove common prefixes
  return moveLists;
}
