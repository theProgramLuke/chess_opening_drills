import { ObservablePositionCollection } from "@/store/repertoire/ObservablePositionCollection";
import { PositionCollection } from "@/store/repertoire/PositionCollection";

jest.mock("@/store/repertoire/PositionCollection");

describe("ObservablePositionCollection", () => {
  describe("addMove", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const fen = "fen";
      const san = "san";

      observable.addMove(fen, san);

      expect(observed.addMove).toBeCalledWith(fen, san);
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.addMove as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.addMove("", "");

      expect(actual).toBe(expected);
    });
  });

  describe("deleteMove", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const fen = "fen";
      const san = "san";

      observable.deleteMove(fen, san);

      expect(observed.deleteMove).toBeCalledWith(fen, san);
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.deleteMove as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.deleteMove("", "");

      expect(actual).toBe(expected);
    });
  });

  describe("movesFromPosition", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const fen = "fen";

      observable.movesFromPosition(fen);

      expect(observed.movesFromPosition).toBeCalledWith(fen);
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.movesFromPosition as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.movesFromPosition("");

      expect(actual).toBe(expected);
    });
  });

  describe("parentPositions", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const fen = "fen";

      observable.parentPositions(fen);

      expect(observed.parentPositions).toBeCalledWith(fen);
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.parentPositions as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.parentPositions("");

      expect(actual).toBe(expected);
    });
  });

  describe("descendantPositions", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const fen = "fen";

      observable.descendantPositions(fen);

      expect(observed.descendantPositions).toBeCalledWith(fen);
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.descendantPositions as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.descendantPositions("");

      expect(actual).toBe(expected);
    });
  });

  describe("asSaved", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);

      observable.asSaved();

      expect(observed.asSaved).toBeCalledWith();
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.asSaved as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.asSaved();

      expect(actual).toBe(expected);
    });
  });

  describe("asPgn", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const fen = "fen";

      observable.asPgn(fen);

      expect(observed.asPgn).toBeCalledWith(fen);
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.asPgn as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.asPgn("");

      expect(actual).toBe(expected);
    });
  });

  describe("loadPgn", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const pgn = "pgn";

      observable.loadPgn(pgn);

      expect(observed.loadPgn).toBeCalledWith(pgn);
    });
  });

  describe("getVariations", () => {
    it("should pass through the call to the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const observable = new ObservablePositionCollection(observed);
      const fen = "fen";

      observable.getVariations(fen);

      expect(observed.getVariations).toBeCalledWith(fen);
    });

    it("should get the result from the observed positionCollection", () => {
      const observed = new PositionCollection({});
      const expected = "observed result";
      (observed.getVariations as jest.Mock).mockReturnValue(expected);
      const observable = new ObservablePositionCollection(observed);

      const actual = observable.getVariations("");

      expect(actual).toBe(expected);
    });
  });
});
