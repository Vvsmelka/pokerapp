import { Card, GamePhase, GameState, Player, PlayerAction } from '../types';
import { createDeck } from './deck';
import { evaluateHand } from './hand-evaluator';

export function initGameState(roomCode: string, players: Player[], startingChips: number): GameState {
  const seats = players.map(p => p.seat);
  const chips: Record<number, number> = {};
  seats.forEach(s => (chips[s] = startingChips));
  return {
    roomCode,
    phase: 'waiting',
    pot: 0,
    communityCards: [],
    currentSeat: -1,
    dealerSeat: seats[0],
    smallBlind: 10,
    bigBlind: 20,
    hands: {},
    bets: {},
    folded: [],
    allin: [],
    minRaise: 20,
    roundNumber: 0,
  };
}

export function startRound(state: GameState, players: Player[]): GameState {
  const activePlayers = players.filter(p => p.chips > 0);
  if (activePlayers.length < 2) return state;

  const deck = createDeck();
  const seats = activePlayers.map(p => p.seat);
  const dealerIdx = nextSeatIdx(seats, state.dealerSeat);
  const dealerSeat = seats[dealerIdx];
  const sbIdx = nextSeatIdx(seats, dealerSeat);
  const sbSeat = seats[sbIdx];
  const bbIdx = nextSeatIdx(seats, sbSeat);
  const bbSeat = seats[bbIdx];

  const hands: Record<number, Card[]> = {};
  seats.forEach((s, i) => {
    hands[s] = [deck[i * 2], deck[i * 2 + 1]];
  });

  const bets: Record<number, number> = {};
  seats.forEach(s => (bets[s] = 0));

  const sbAmount = Math.min(state.smallBlind, getChips(players, sbSeat));
  const bbAmount = Math.min(state.bigBlind, getChips(players, bbSeat));
  bets[sbSeat] = sbAmount;
  bets[bbSeat] = bbAmount;

  const firstIdx = nextSeatIdx(seats, bbSeat);

  return {
    ...state,
    phase: 'preflop',
    pot: sbAmount + bbAmount,
    communityCards: [],
    currentSeat: seats[firstIdx],
    dealerSeat,
    hands,
    bets,
    folded: [],
    allin: [],
    minRaise: state.bigBlind,
    winners: undefined,
    roundNumber: state.roundNumber + 1,
  };
}

export function applyAction(
  state: GameState,
  players: Player[],
  seat: number,
  action: PlayerAction,
  amount?: number
): GameState {
  if (state.currentSeat !== seat) return state;

  let { pot, bets, folded, allin } = state;
  const currentBet = Math.max(...Object.values(bets));
  const playerChips = getChips(players, seat);
  const playerBet = bets[seat] ?? 0;
  const callAmount = currentBet - playerBet;

  const newBets = { ...bets };
  let newFolded = [...folded];
  let newAllin = [...allin];
  let newPot = pot;
  let newMinRaise = state.minRaise;

  switch (action) {
    case 'fold':
      newFolded = [...newFolded, seat];
      break;

    case 'check':
      break;

    case 'call': {
      const toCall = Math.min(callAmount, playerChips);
      newBets[seat] = playerBet + toCall;
      newPot += toCall;
      if (toCall >= playerChips) newAllin = [...newAllin, seat];
      break;
    }

    case 'raise': {
      const raiseTotal = amount ?? currentBet + state.minRaise;
      const actualRaise = Math.min(raiseTotal, playerBet + playerChips);
      const added = actualRaise - playerBet;
      newBets[seat] = actualRaise;
      newPot += added;
      newMinRaise = actualRaise - currentBet;
      if (added >= playerChips) newAllin = [...newAllin, seat];
      break;
    }

    case 'allin': {
      const allInAmount = playerBet + playerChips;
      newBets[seat] = allInAmount;
      newPot += playerChips;
      newAllin = [...newAllin, seat];
      if (allInAmount > currentBet) newMinRaise = allInAmount - currentBet;
      break;
    }
  }

  const activePlayers = players.filter(p => p.chips > 0);
  const seats = activePlayers.map(p => p.seat);
  const nextSeat = findNextSeat(seats, seat, newFolded, newAllin, newBets, newBets);

  let newState: GameState = {
    ...state,
    pot: newPot,
    bets: newBets,
    folded: newFolded,
    allin: newAllin,
    minRaise: newMinRaise,
    lastAction: { seat, action, amount },
  };

  const stillIn = seats.filter(s => !newFolded.includes(s));
  if (stillIn.length === 1) {
    return resolveRound(newState, players);
  }

  const bettingDone = isBettingDone(seats, newFolded, newAllin, newBets);
  if (bettingDone) {
    newState = advancePhase(newState, players);
  } else {
    newState.currentSeat = nextSeat;
  }

  return newState;
}

function advancePhase(state: GameState, players: Player[]): GameState {
  const phases: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const idx = phases.indexOf(state.phase);
  const nextPhase = phases[idx + 1] ?? 'showdown';

  const activePlayers = players.filter(p => p.chips > 0);
  const seats = activePlayers.map(p => p.seat);
  const newBets: Record<number, number> = {};
  seats.forEach(s => (newBets[s] = 0));

  if (nextPhase === 'showdown') {
    return resolveRound({ ...state, bets: newBets }, players);
  }

  const communityCount = nextPhase === 'flop' ? 3 : nextPhase === 'turn' ? 4 : 5;
  const newCommunity = [...state.communityCards];
  const deck = createDeck();
  while (newCommunity.length < communityCount) {
    const card = deck.find(c =>
      !newCommunity.some(cc => cc.rank === c.rank && cc.suit === c.suit) &&
      !Object.values(state.hands).flat().some(hc => hc.rank === c.rank && hc.suit === c.suit)
    );
    if (card) newCommunity.push(card);
  }

  const firstActive = seats.find(s => !state.folded.includes(s) && !state.allin.includes(s));
  const nextSeat = firstActive ?? seats.find(s => !state.folded.includes(s)) ?? seats[0];

  return {
    ...state,
    phase: nextPhase,
    communityCards: newCommunity,
    bets: newBets,
    currentSeat: nextSeat,
    minRaise: state.bigBlind,
  };
}

function resolveRound(state: GameState, players: Player[]): GameState {
  const activePlayers = players.filter(p => p.chips > 0);
  const seats = activePlayers.map(p => p.seat);
  const stillIn = seats.filter(s => !state.folded.includes(s));

  const winners: GameState['winners'] = [];

  if (stillIn.length === 1) {
    winners.push({ seat: stillIn[0], handName: 'Last Standing', amount: state.pot });
  } else {
    const results = stillIn.map(seat => ({
      seat,
      ...evaluateHand(state.hands[seat] ?? [], state.communityCards),
    }));
    results.sort((a, b) => b.score - a.score);
    const best = results[0].score;
    const tied = results.filter(r => r.score === best);
    const share = Math.floor(state.pot / tied.length);
    tied.forEach(r => winners.push({ seat: r.seat, handName: r.name, amount: share }));
  }

  return {
    ...state,
    phase: 'showdown',
    winners,
    currentSeat: -1,
  };
}

function isBettingDone(
  seats: number[],
  folded: number[],
  allin: number[],
  bets: Record<number, number>
): boolean {
  const active = seats.filter(s => !folded.includes(s) && !allin.includes(s));
  if (active.length === 0) return true;
  const maxBet = Math.max(...Object.values(bets));
  return active.every(s => bets[s] === maxBet);
}

function findNextSeat(
  seats: number[],
  current: number,
  folded: number[],
  allin: number[],
  oldBets: Record<number, number>,
  newBets: Record<number, number>
): number {
  const active = seats.filter(s => !folded.includes(s) && !allin.includes(s));
  if (active.length === 0) return -1;
  const idx = seats.indexOf(current);
  for (let i = 1; i <= seats.length; i++) {
    const next = seats[(idx + i) % seats.length];
    if (active.includes(next)) return next;
  }
  return active[0];
}

function nextSeatIdx(seats: number[], after: number): number {
  const idx = seats.indexOf(after);
  return (idx + 1) % seats.length;
}

function getChips(players: Player[], seat: number): number {
  return players.find(p => p.seat === seat)?.chips ?? 0;
}

export function applyWinnings(players: Player[], state: GameState): Player[] {
  if (!state.winners) return players;
  const betsDeducted = { ...state.bets };
  const updated = players.map(p => {
    const bet = betsDeducted[p.seat] ?? 0;
    const won = state.winners!.find(w => w.seat === p.seat)?.amount ?? 0;
    return { ...p, chips: p.chips - bet + won };
  });
  return updated;
}
