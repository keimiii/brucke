import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';
import bcrypt from 'bcryptjs';

// Database types based on your schema
export interface Player {
    id: string;
    user_id: string;
    created_at: string;
    email: string;
    password: string;
    room_id: string | null;
    username?: string; // Adding username field
}

export interface Room {
    id: string;
    room_id: string;
    created_at: string;
    game_id: string | null;
    status: 'waiting' | 'playing' | 'finished';
}

export interface Database {
    public: {
        Tables: {
            player: {
                Row: Player;
                Insert: Omit<Player, 'id' | 'created_at'>;
                Update: Partial<Omit<Player, 'id' | 'created_at'>>;
            };
            room: {
                Row: Room;
                Insert: Omit<Room, 'id' | 'created_at'>;
                Update: Partial<Omit<Room, 'id' | 'created_at'>>;
            };
        };
    };
}

export class SupabaseService {
    private client: SupabaseClient<Database>;

    constructor() {
        this.client = createClient<Database>(
            config.supabase.url,
            config.supabase.anonKey
        );
    }

    // Authentication operations
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    async findPlayerByUsernameOrEmail(usernameOrEmail: string): Promise<Player | null> {
        const { data, error } = await this.client
            .from('player')
            .select('*')
            .or(`email.eq.${usernameOrEmail},username.eq.${usernameOrEmail}`)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows returned
            }
            throw new Error(`Failed to find player: ${error.message}`);
        }

        return data;
    }

    async authenticatePlayer(usernameOrEmail: string, password: string): Promise<Player | null> {
        const player = await this.findPlayerByUsernameOrEmail(usernameOrEmail);
        
        if (!player) {
            return null;
        }

        const isPasswordValid = await this.comparePassword(password, player.password);
        return isPasswordValid ? player : null;
    }

    // Player operations
    async createPlayer(playerData: Database['public']['Tables']['player']['Insert']): Promise<Player> {
        // Hash the password before storing
        const hashedPassword = await this.hashPassword(playerData.password);
        
        const { data, error } = await this.client
            .from('player')
            .insert({
                ...playerData,
                password: hashedPassword
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create player: ${error.message}`);
        }

        return data;
    }

    async getPlayerByUserId(userId: string): Promise<Player | null> {
        const { data, error } = await this.client
            .from('player')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows returned
            }
            throw new Error(`Failed to get player: ${error.message}`);
        }

        return data;
    }

    async updatePlayerRoom(userId: string, roomId: string | null): Promise<Player> {
        const { data, error } = await this.client
            .from('player')
            .update({ room_id: roomId })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update player room: ${error.message}`);
        }

        return data;
    }

    async getPlayersInRoom(roomId: string): Promise<Player[]> {
        const { data, error } = await this.client
            .from('player')
            .select('*')
            .eq('room_id', roomId);

        if (error) {
            throw new Error(`Failed to get players in room: ${error.message}`);
        }

        return data || [];
    }

    // Room operations
    async createRoom(roomData: Database['public']['Tables']['room']['Insert']): Promise<Room> {
        const { data, error } = await this.client
            .from('room')
            .insert(roomData)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create room: ${error.message}`);
        }

        return data;
    }

    async getAllRooms(): Promise<Room[]> {
        const { data, error } = await this.client
            .from('room')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get rooms: ${error.message}`);
        }

        return data || [];
    }

    async getRoomById(roomId: string): Promise<Room | null> {
        const { data, error } = await this.client
            .from('room')
            .select('*')
            .eq('room_id', roomId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows returned
            }
            throw new Error(`Failed to get room: ${error.message}`);
        }

        return data;
    }

    async updateRoomStatus(roomId: string, status: Room['status']): Promise<Room> {
        const { data, error } = await this.client
            .from('room')
            .update({ status })
            .eq('room_id', roomId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update room status: ${error.message}`);
        }

        return data;
    }

    async updateRoomGameId(roomId: string, gameId: string | null): Promise<Room> {
        const { data, error } = await this.client
            .from('room')
            .update({ game_id: gameId })
            .eq('room_id', roomId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update room game ID: ${error.message}`);
        }

        return data;
    }

    async deleteRoom(roomId: string): Promise<void> {
        const { error } = await this.client
            .from('room')
            .delete()
            .eq('room_id', roomId);

        if (error) {
            throw new Error(`Failed to delete room: ${error.message}`);
        }
    }
}

// Export a singleton instance
export const supabaseService = new SupabaseService();
