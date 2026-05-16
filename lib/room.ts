import { supabase } from './supabase';
import { Player, Room, StackSize } from '../types';

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createRoom(player: Player, stackSize: StackSize): Promise<Room | null> {
  const code = generateCode();
  const playerWithStack = { ...player, chips: stackSize, isHost: true, seat: 0 };

  const { error } = await supabase.from('rooms').insert({
    code,
    host_id: player.id,
    status: 'waiting',
    max_players: 6,
    players: [playerWithStack],
    game_state: null,
  });

  if (error) return null;
  return { code, hostId: player.id, status: 'waiting', maxPlayers: 6, players: [playerWithStack] };
}

export async function joinRoom(code: string, player: Player, stackSize: StackSize): Promise<Room | null> {
  const { data, error } = await supabase.from('rooms').select().eq('code', code).single();
  if (error || !data) return null;
  if (data.status !== 'waiting') return null;
  if (data.players.length >= data.max_players) return null;

  const seat = data.players.length;
  const newPlayer = { ...player, chips: stackSize, isHost: false, seat };
  const players = [...data.players, newPlayer];

  await supabase.from('rooms').update({ players }).eq('code', code);
  return { ...data, players };
}

export async function getRoom(code: string): Promise<Room | null> {
  const { data, error } = await supabase.from('rooms').select().eq('code', code).single();
  if (error || !data) return null;
  return data as Room;
}

export async function updateRoom(code: string, patch: Partial<Room>): Promise<void> {
  await supabase.from('rooms').update(patch).eq('code', code);
}

export function subscribeToRoom(code: string, onChange: (room: Room) => void) {
  const channel = supabase
    .channel(`room:${code}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
      payload => onChange(payload.new as Room)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
