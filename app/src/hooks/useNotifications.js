import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addNotification,
    markAllAsReadInState,
    markAsReadInState,
    setLoading,
    setNotifications
} from '../redux/notificationSlice';
import NotificationService from '../services/NotificationService';
import { supabase } from '../utils/supabase';

export const useNotifications = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const { items: notifications, unreadCount, loading } = useSelector((state) => state.notifications);

    const fetchNotifications = useCallback(async (showLoading = true) => {
        if (!user?.id) return;

        if (showLoading) dispatch(setLoading(true));
        try {
            const data = await NotificationService.getNotifications(user.id);
            dispatch(setNotifications(data || []));
        } catch (error) {
            console.error("Error fetching notifications in hook:", error);
        } finally {
            dispatch(setLoading(false));
        }
    }, [user?.id, dispatch]);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();

            const channel = supabase
                .channel(`global-notifications-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            dispatch(addNotification(payload.new));
                        } else {
                            
                            fetchNotifications(false);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user?.id, dispatch, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await NotificationService.markAsRead(id);
            dispatch(markAsReadInState(id));
        } catch (error) {
            console.error("Error marking as read in hook:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await NotificationService.markAllAsRead(user.id);
            dispatch(markAllAsReadInState());
        } catch (error) {
            console.error("Error marking all as read in hook:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
};
