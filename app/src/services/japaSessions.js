import { supabase } from '../utils/supabase';

export const fetchTodaySession = async (userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('japa_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching today session:', error);
        throw error;
    }
};

export const fetchRecentSessions = async (userId, limit = 30) => {
    try {
        const { data, error } = await supabase
            .from('japa_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }
};

export const calculateStats = (sessions) => {
    if (!sessions || sessions.length === 0) {
        return {
            totalRounds: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageRounds: 0,
            totalSessions: 0
        };
    }

    const totalRounds = sessions.reduce((sum, s) => sum + (s.completed_rounds || 0), 0);
    const totalSessions = sessions.length;
    const averageRounds = totalSessions > 0 ? totalRounds / totalSessions : 0;

    let currentStreak = 0;
    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const session of sortedSessions) {
        if (session.completed_rounds > 0) {
            currentStreak++;
        } else {
            break;
        }
    }

    const longestStreak = currentStreak;

    return {
        totalRounds,
        currentStreak,
        longestStreak,
        averageRounds: Math.round(averageRounds),
        totalSessions
    };
};

export const startSession = async (userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const existingSession = await fetchTodaySession(userId);

        if (existingSession) {
            
            if (!existingSession.start_time) {
                const { data, error } = await supabase
                    .from('japa_sessions')
                    .update({
                        start_time: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingSession.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
            return existingSession;
        } else {
            
            const { data, error } = await supabase
                .from('japa_sessions')
                .insert({
                    user_id: userId,
                    date: today,
                    completed_rounds: 0,
                    target_rounds: 16,
                    start_time: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error starting session:', error);
        throw error;
    }
};

export const completeRound = async (userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let session = await fetchTodaySession(userId);

        if (!session) {
            
            session = await startSession(userId);
        }

        const { data, error } = await supabase
            .from('japa_sessions')
            .update({
                completed_rounds: (session.completed_rounds || 0) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error completing round:', error);
        throw error;
    }
};

export const undoRound = async (userId) => {
    try {
        const session = await fetchTodaySession(userId);

        if (!session || session.completed_rounds <= 0) {
            return session;
        }

        const { data, error } = await supabase
            .from('japa_sessions')
            .update({
                completed_rounds: session.completed_rounds - 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error undoing round:', error);
        throw error;
    }
};

export const endSession = async (userId, notes = null) => {
    try {
        const session = await fetchTodaySession(userId);
        if (!session) {
            throw new Error('No active session found');
        }

        const startTime = session.start_time ? new Date(session.start_time) : new Date();
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        const { data, error } = await supabase
            .from('japa_sessions')
            .update({
                end_time: endTime.toISOString(),
                session_duration: duration,
                notes: notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error ending session:', error);
        throw error;
    }
};

export const resetSession = async (userId) => {
    try {
        const session = await fetchTodaySession(userId);
        if (!session) {
            return null;
        }

        const { data, error } = await supabase
            .from('japa_sessions')
            .update({
                completed_rounds: 0,
                start_time: null,
                end_time: null,
                session_duration: null,
                notes: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error resetting session:', error);
        throw error;
    }
};
