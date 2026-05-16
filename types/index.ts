export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'allin';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  seat: number;
  isConnected: boolean;
  isHost: boolean;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  pot: number;
  communityCards: Card[];
  currentSeat: number;
  dealerSeat: number;
  smallBlind: number;
  bigBlind: number;
  hands: Record<number, Card[]>;
  bets: Record<number, number>;
  folded: number[];
  allin: number[];
  minRaise: number;
  lastAction?: { seat: number; action: PlayerAction; amount?: number };
  winners?: { seat: number; handName: string; amount: number }[];
  roundNumber: number;
}

export interface Room {
  code: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  players: Player[];
  gameState?: GameState;
}

export type StackSize = 200 | 500 | 1000;
