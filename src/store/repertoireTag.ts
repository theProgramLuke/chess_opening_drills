import _ from "lodash";
import { Guid } from "guid-typescript";

import { Side } from "./side";
import { FEN } from "chessground/types";
import { RepertoirePosition } from "./repertoirePosition";
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
  tags: RepertoireTag[],
  difficultyModeLimit = 0
): RepertoirePosition[] {
  const positions: RepertoirePosition[] = [];

  _.forEach(tags, tag => {
    tag.position.VisitChildren((position: RepertoirePosition) => {
      let matchingMode = false;
      _.forEach(modes, mode => {
        matchingMode =
          matchingMode ||
          position.IncludeForTrainingMode(mode, difficultyModeLimit);
      });

      const anyChildren = !_.isEmpty(position.children);

      if (position.myTurn && anyChildren && matchingMode) {
        positions.push(position);
      }
    });
  });

  return positions;
}

function IsPrefix<T>(list: T[], potentialPrefix: T[]): boolean {
  if (potentialPrefix.length > list.length) {
    return false;
  }

  let foundMismatch = false;
  _.forEach(potentialPrefix, (entry, index) => {
    if (!foundMismatch && entry !== list[index]) {
      foundMismatch = true;
    }
  });

  return !foundMismatch;
}

function RemovePrefixes<T>(moveLists: T[][]): T[][] {
  return _.filter(moveLists, potentialPrefix => {
    let foundAsPrefix = false;
    _.forEach(moveLists, moveList => {
      if (moveList !== potentialPrefix) {
        foundAsPrefix = foundAsPrefix || IsPrefix(moveList, potentialPrefix);
      }
    });
    return !foundAsPrefix;
  });
}

export function GetTrainingMoveLists(
  modes: TrainingMode[],
  tags: RepertoireTag[],
  difficultyModeLimit = 0,
  entireVariations = true
): Move[][] {
  const moveLists: Move[][] = [];
  const parents = GetTrainingPositions(modes, tags, difficultyModeLimit);

  _.forEach(parents, parent => {
    const paths = parent.children[0].position.RootPaths();

    if (entireVariations) {
      moveLists.push(...paths);
    } else {
      moveLists.push(..._.map(paths, p => _.takeRight(p, 2)));
    }
  });

  console.log(moveLists);

  return RemovePrefixes(_.uniqWith(moveLists, _.isEqual));
}
