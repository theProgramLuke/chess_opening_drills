import { parsePgn } from "@/store/pgnParser";

describe("parse", () => {
  it("should get the PGN of a game", () => {
    const parsed = parsePgn(
      '[White "me"]\n[Black "you"]\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 (3. ...Nf6 {is the two knights}) 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 $1 *'
    );

    expect(parsed).toMatchSnapshot();
  });

  it("should fail for invalid PGN", () => {
    const parse = () => parsePgn("invalid");

    expect(parse).toThrowError(
      'Expected " ", "*", ".", "0-1", "1-0", "1/2-1/2", ";", "O-O", "O-O-O", "[", "\\n", "\\r", "\\t", "\\x0C", "{", [1-9], [N,K,Q,R,B], or [a-h] but "i" found.'
    );
  });
});
