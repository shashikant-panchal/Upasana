import { supabase } from '../utils/supabase';

export const fetchUserRooms = async (userId) => {
    try {
        
        const { data: memberData, error: memberError } = await supabase
            .from('japa_room_members')
            .select('room_id')
            .eq('user_id', userId);

        if (memberError) throw memberError;
        if (!memberData?.length) return [];

        const roomIds = memberData.map((m) => m.room_id);
        const { data, error } = await supabase
            .from('japa_rooms')
            .select('*')
            .in('id', roomIds)
            .eq('is_active', true)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
};

export const createRoom = async (userId, name, description = '') => {
    try {
        const { data, error } = await supabase
            .from('japa_rooms')
            .insert({ name, description: description || null, created_by: userId })
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('japa_room_members')
            .insert({ room_id: data.id, user_id: userId, role: 'owner' });

        return { success: true, room: data };
    } catch (error) {
        console.error('Error creating room:', error);
        return { success: false, error: error.message };
    }
};

export const joinRoom = async (userId, inviteCode) => {
    try {
        const { data: room, error: roomError } = await supabase
            .from('japa_rooms')
            .select('*')
            .eq('invite_code', inviteCode.trim().toLowerCase())
            .eq('is_active', true)
            .single();

        if (roomError || !room) {
            return { success: false, error: 'Room not found. Check the invite code.' };
        }

        const { data: existing } = await supabase
            .from('japa_room_members')
            .select('id')
            .eq('room_id', room.id)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            return { success: true, room, alreadyMember: true };
        }

        const { error } = await supabase
            .from('japa_room_members')
            .insert({ room_id: room.id, user_id: userId, role: 'member' });

        if (error) throw error;
        return { success: true, room };
    } catch (error) {
        console.error('Error joining room:', error);
        return { success: false, error: error.message };
    }
};

export const fetchRoomMembers = async (roomId) => {
    try {
        const { data, error } = await supabase
            .from('japa_room_members')
            .select('*')
            .eq('room_id', roomId);

        if (error) throw error;
        if (!data?.length) return [];

        const userIds = data.map((m) => m.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url, username')
            .in('user_id', userIds);

        return data.map((m) => {
            const p = profiles?.find((pr) => pr.user_id === m.user_id);
            return {
                ...m,
                display_name: p?.display_name || p?.username || 'Anonymous',
                avatar_url: p?.avatar_url,
            };
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        return [];
    }
};

export const fetchActiveRoomSession = async (roomId) => {
    try {
        const { data, error } = await supabase
            .from('japa_room_sessions')
            .select('*')
            .eq('room_id', roomId)
            .eq('is_active', true)
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching active session:', error);
        return null;
    }
};

export const fetchSessionCounts = async (sessionId) => {
    try {
        const { data, error } = await supabase
            .from('japa_room_counts')
            .select('*')
            .eq('session_id', sessionId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching counts:', error);
        return [];
    }
};

export const fetchPastRoomSessions = async (roomId) => {
    try {
        const { data, error } = await supabase
            .from('japa_room_sessions')
            .select('*')
            .eq('room_id', roomId)
            .eq('is_active', false)
            .order('started_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching past sessions:', error);
        return [];
    }
};

export const startRoomSession = async (userId, roomId) => {
    try {
        const { data, error } = await supabase
            .from('japa_room_sessions')
            .insert({ room_id: roomId, started_by: userId })
            .select()
            .single();

        if (error) throw error;
        return { success: true, session: data };
    } catch (error) {
        console.error('Error starting room session:', error);
        return { success: false, error: error.message };
    }
};

export const endRoomSession = async (sessionId) => {
    try {
        const { error } = await supabase
            .from('japa_room_sessions')
            .update({ is_active: false, ended_at: new Date().toISOString() })
            .eq('id', sessionId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error ending room session:', error);
        return { success: false, error: error.message };
    }
};

export const incrementRoomCount = async (userId, sessionId, roomId, currentCounts) => {
    try {
        const existing = currentCounts.find((c) => c.user_id === userId);
        if (existing) {
            const { data, error } = await supabase
                .from('japa_room_counts')
                .update({ rounds: existing.rounds + 1, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, count: data };
        } else {
            const { data, error } = await supabase
                .from('japa_room_counts')
                .insert({ session_id: sessionId, room_id: roomId, user_id: userId, rounds: 1 })
                .select()
                .single();

            if (error) throw error;
            return { success: true, count: data, isNew: true };
        }
    } catch (error) {
        console.error('Error incrementing room count:', error);
        return { success: false, error: error.message };
    }
};

export const undoRoomCount = async (userId, sessionId, currentCounts) => {
    try {
        const existing = currentCounts.find((c) => c.user_id === userId);
        if (!existing || existing.rounds <= 0) return { success: false };

        const { data, error } = await supabase
            .from('japa_room_counts')
            .update({ rounds: existing.rounds - 1, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, count: data };
    } catch (error) {
        console.error('Error undoing room count:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToRoomCounts = (roomId, onCountChange) => {
    return supabase
        .channel(`room-counts-${roomId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'japa_room_counts', filter: `room_id=eq.${roomId}` },
            (payload) => onCountChange(payload)
        )
        .subscribe();
};

export const subscribeToRoomSessions = (roomId, onSessionChange) => {
    return supabase
        .channel(`room-sessions-${roomId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'japa_room_sessions', filter: `room_id=eq.${roomId}` },
            (payload) => onSessionChange(payload)
        )
        .subscribe();
};

export const unsubscribeChannel = (channel) => {
    if (channel) supabase.removeChannel(channel);
};
