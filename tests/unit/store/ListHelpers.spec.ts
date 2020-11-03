import { filterPrefixLists } from "@/store/ListHelpers";

describe("filterPrefixLists", () => {
  it("should filter lists that are a prefix of other lists in the list", () => {
    const lists = [
      [0, 1, 2, 3],
      [0, 1],
      [1, 2],
    ];
    const expected = [lists[0], lists[2]];

    const actual = filterPrefixLists(lists);

    expect(actual).toEqual(expected);
  });

  it("should find deep equality", () => {
    const lists = [
      [
        {
          sourceFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
          resultingFen:
            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
          san: "e4",
        },
        {
          sourceFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
          resultingFen:
            "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
          san: "e5",
        },
        {
          sourceFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
          san: "Nf3",
          resultingFen:
            "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -",
        },
      ],
      [
        {
          sourceFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
          resultingFen:
            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
          san: "e4",
        },
        {
          sourceFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
          resultingFen:
            "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
          san: "e5",
        },
        {
          sourceFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
          resultingFen:
            "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -",
          san: "Nf3",
        },
        {
          sourceFen:
            "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -",
          resultingFen:
            "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -",
          san: "Nc6",
        },
        {
          sourceFen:
            "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -",
          san: "Bc4",
          resultingFen:
            "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -",
        },
      ],
    ];

    const actual = filterPrefixLists(lists);

    expect(actual.length).toEqual(1);
  });
});
