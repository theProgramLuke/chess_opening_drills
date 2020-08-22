import { parse } from "@/store/pgnGrammar";

export interface PgnMove {
  moveNumber?: number;
  move?: string;
  nags?: string[];
  ravs?: PgnRav[];
  comments?: string;
}

export interface PgnHeader {
  name: string;
  value: string;
}

export interface PgnRav {
  moves: PgnMove[];
  result: string;
}

export interface PgnGame {
  commentsAboveHeader: string;
  headers: PgnHeader[];
  comments: string;
  moves: PgnMove[];
  result: string;
}

export function parsePgn(pgnText: string): PgnGame[] {
  return parse(pgnText) as PgnGame[];
}
