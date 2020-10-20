import _ from "lodash";

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

export function filterPrefixLists<T>(lists: T[][]): T[][] {
  return _.filter(lists, potentialPrefix => {
    let foundAsPrefix = false;
    _.forEach(lists, moveList => {
      if (moveList !== potentialPrefix) {
        foundAsPrefix = foundAsPrefix || IsPrefix(moveList, potentialPrefix);
      }
    });
    return !foundAsPrefix;
  });
}
