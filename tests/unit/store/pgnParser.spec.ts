import { parsePgn } from "@/store/pgnParser";

describe("parse", () => {
  it("should get the PGN of a game", () => {
    const parsed = parsePgn(
      '[White "me"]\n[Black "you"]\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 (3. ...Nf6 {is the two knights}) 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 $1 *'
    );

    expect(parsed).toEqual([
      {
        comments: null,
        commentsAboveHeader: null,
        headers: [
          { name: "White", value: "me" },
          { name: "Black", value: "you" }
        ],
        moves: [
          { comments: [], move: "e4", moveNumber: 1 },
          { comments: [], move: "e5" },
          { comments: [], move: "Nf3", moveNumber: 2 },
          { comments: [], move: "Nc6" },
          { comments: [], move: "Bc4", moveNumber: 3 },
          {
            comments: [],
            move: "Bc5",
            ravs: [
              {
                moves: [
                  {
                    comments: [{ text: "is the two knights" }],
                    move: "...Nf6",
                    moveNumber: 3
                  }
                ],
                result: null
              }
            ]
          },
          { comments: [], move: "b4", moveNumber: 4 },
          { comments: [], move: "Bxb4" },
          { comments: [], move: "c3", moveNumber: 5 },
          { comments: [], move: "Ba5" },
          { comments: [], move: "d4", moveNumber: 6 },
          { comments: [], move: "exd4" },
          { comments: [], move: "O-O", moveNumber: 7 },
          { comments: [], move: "Nge7", nags: ["$1"] }
        ],
        result: "*"
      }
    ]);
  });

  it("should fail for invalid PGN", () => {
    const parse = () => parsePgn("invalid");

    expect(parse).toThrowError(
      'Expected " ", "*", ".", "0-1", "1-0", "1/2-1/2", ";", "O-O", "O-O-O", "[", "\\n", "\\r", "\\t", "\\x0C", "{", [1-9], [N,K,Q,R,B], or [a-h] but "i" found.'
    );
  });
});
