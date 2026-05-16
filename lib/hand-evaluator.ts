import { Card } from '../types';
import { rankValue } from './deck';

export interface HandResult {
  score: number;
  name: string;
}

export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandResult {
  const all = [...holeCards, ...communityCards];
  const combos = getCombinations(all, 5);
  let best: HandResult = { score: 0, name: 'High Card' };
  for (const combo of combos) {
    const r = score5(combo);
    if (r.score > best.score) best = r;
  }
  return best;
}

function getCombinations(cards: Card[], k: number): Card[][] {
  if (k === 0) return [[]];
  if (cards.length < k) return [];
  const [first, ...rest] = cards;
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function score5(cards: Card[]): HandResult {
  const ranks = cards.map(c => rankValue(c.rank)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(ranks);
  const counts = countRanks(ranks);
  const groups = Object.values(counts).sort((a, b) => b - a);

  if (isFlush && isStraight) {
    const isRoyal = ranks[0] === 14 && ranks[4] === 10;
    return isRoyal
      ? { score: 9_000_000 + ranks[0], name: 'Royal Flush' }
      : { score: 8_000_000 + ranks[0], name: 'Straight Flush' };
  }
  if (groups[0] === 4) return { score: 7_000_000 + fourScore(counts), name: 'Four of a Kind' };
  if (groups[0] === 3 && groups[1] === 2) return { score: 6_000_000 + fullHouseScore(counts), name: 'Full House' };
  if (isFlush) return { score: 5_000_000 + handScore(ranks), name: 'Flush' };
  if (isStraight) return { score: 4_000_000 + ranks[0], name: 'Straight' };
  if (groups[0] === 3) return { score: 3_000_000 + threeScore(counts), name: 'Three of a Kind' };
  if (groups[0] === 2 && groups[1] === 2) return { score: 2_000_000 + twoPairScore(counts), name: 'Two Pair' };
  if (groups[0] === 2) return { score: 1_000_000 + pairScore(counts), name: 'One Pair' };
  return { score: handScore(ranks), name: 'High Card' };
}

function checkStraight(sortedRanks: number[]): boolean {
  if (sortedRanks[0] - sortedRanks[4] === 4 && new Set(sortedRanks).size === 5) return true;
  if (sortedRanks[0] === 14) {
    const low = [5, 4, 3, 2, 1];
    return sortedRanks.slice(1).every((v, i) => v === low[i]);
  }
  return false;
}

function countRanks(ranks: number[]): Record<number, number> {
  return ranks.reduce((acc, r) => ({ ...acc, [r]: (acc[r] ?? 0) + 1 }), {} as Record<number, number>);
}

function handScore(ranks: number[]): number {
  return ranks.reduce((acc, r, i) => acc + r * Math.pow(15, 4 - i), 0);
}

function fourScore(counts: Record<number, number>): number {
  const four = +Object.keys(counts).find(k => counts[+k] === 4)!;
  return four * 100;
}

function fullHouseScore(counts: Record<number, number>): number {
  const three = +Object.keys(counts).find(k => counts[+k] === 3)!;
  const two = +Object.keys(counts).find(k => counts[+k] === 2)!;
  return three * 100 + two;
}

function threeScore(counts: Record<number, number>): number {
  return +Object.keys(counts).find(k => counts[+k] === 3)! * 1000;
}

function twoPairScore(counts: Record<number, number>): number {
  const pairs = Object.keys(counts).filter(k => counts[+k] === 2).map(Number).sort((a, b) => b - a);
  const kicker = +Object.keys(counts).find(k => counts[+k] === 1)!;
  return pairs[0] * 10000 + pairs[1] * 100 + kicker;
}

function pairScore(counts: Record<number, number>): number {
  const pair = +Object.keys(counts).find(k => counts[+k] === 2)!;
  const kickers = Object.keys(counts).filter(k => counts[+k] === 1).map(Number).sort((a, b) => b - a);
  return pair * 100000 + kickers.reduce((a, v, i) => a + v * Math.pow(15, 2 - i), 0);
}
