import { filterPrefixLists } from "@/store/ListHelpers";

describe("filterPrefixLists", () => {
  it("should filter lists that are a prefix of other lists in the list", () => {
    const lists = [
      [0, 1, 2, 3],
      [0, 1],
      [1, 2]
    ];
    const expected = [lists[0], lists[2]];

    const actual = filterPrefixLists(lists);

    expect(actual).toEqual(expected);
  });
});
