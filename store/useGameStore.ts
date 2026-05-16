import { create } from 'zustand';
import { GameState, Player, Room, StackSize } from '../types';

interface GameStore {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  room: Room | null;
  gameState: GameState | null;
  myCards: never[];

  setProfile: (name: string, avatar: string) => void;
  setRoom: (room: Room | null) => void;
  setGameState: (state: GameState | null) => void;
  updatePlayer: (player: Player) => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

export const useGameStore = create<GameStore>((set, get) => ({
  playerId: generateId(),
  playerName: '',
  playerAvatar: '🎰',
  room: null,
  gameState: null,
  myCards: [],

  setProfile: (name, avatar) => set({ playerName: name, playerAvatar: avatar }),

  setRoom: (room) => set({ room }),

  setGameState: (gameState) => set({ gameState }),

  updatePlayer: (player) =>
    set(s => ({
      room: s.room
        ? {
            ...s.room,
            players: s.room.players.map(p => (p.id === player.id ? player : p)),
          }
        : null,
    })),

  reset: () => set({ room: null, gameState: null }),
}));
