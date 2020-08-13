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

function _findTag(tag: RepertoireTag, id: number): RepertoireTag | null {
  if (tag["id"] === id) {
    return tag;
  }

  if (tag["children"].length === 0) {
    return null;
  }

  const mapped = tag["children"].map((child: RepertoireTag) =>
    _findTag(child, id)
  );
  const filtered = mapped.filter((child: RepertoireTag | null) => {
    return child != null;
  });

  return filtered[0];
}

export function FindRepertoireTag(
  tags: Array<RepertoireTag>,
  id: number
): RepertoireTag | null {
  const mapped = tags.map((child: RepertoireTag) => _findTag(child, id));
  const filtered = mapped.filter((child: RepertoireTag | null) => {
    return child != null;
  });

  // assert(filtered.length === 1, "Should only find one matching tag...");

  return filtered[0];
}
