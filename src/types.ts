export type GameStatus = "playing" | "won" | "lost";

export interface HintState {
  text: string;
  type: "start" | "higher" | "lower" | "win" | "lose" | "invalid";
}

export interface PlayerRank {
  id: string;
  name: string;
  score: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  isCustomPlayer?: boolean;
}

export interface GameSettings {
  username: string;
  difficulty: "easy" | "medium" | "hard";
  soundEnabled: boolean;
  minRange: number;
  maxRange: number;
}

export interface GameStats {
  targetNumber: number;
  chancesLeft: number;
  maxChances: number;
  previousGuesses: { value: number; result: "higher" | "lower" | "correct" }[];
  status: GameStatus;
  hint: HintState;
  score: number;
}
