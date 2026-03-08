import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { supabase } from '../utils/supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    constructor() {
        this.token = null;
    }

    async getDeviceToken() {
        try {
            const enabled = await this.checkPermission();
            if (enabled) {
                this.token = await messaging().getToken();
                return this.token;
            }
            return null;
        } catch (error) {
            console.error('Error getting device token:', error);
            return null;
        }
    }

    async initialize(userId) {
        if (!userId) return;

        try {
            const token = await this.getDeviceToken();
            if (token) {
                console.log('FCM Token:', token);

                await this.updatePushToken(userId, this.token);

                this.setupListeners(userId);
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    async checkPermission() {
        const authStatus = await messaging().hasPermission();
        return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    }

    async requestPermission() {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            return enabled;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    async updatePushToken(userId, token) {
        try {
            
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('notification_preferences')
                .eq('user_id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            const currentPrefs = data?.notification_preferences || {};
            const updatedPrefs = {
                ...currentPrefs,
                push_token: token,
                push_enabled: true,
            };

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ notification_preferences: updatedPrefs })
                .eq('user_id', userId);

            if (updateError) throw updateError;

            await this.syncWithBackend(updatedPrefs);
        } catch (error) {
            console.error('Error updating push token in Supabase:', error);
        }
    }

    setupListeners(userId) {
        
        messaging().onTokenRefresh(token => {
            this.token = token;
            this.updatePushToken(userId, token);
        });

        messaging().onMessage(async remoteMessage => {
            console.log('Foreground notification received:', remoteMessage);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: remoteMessage.notification?.title || 'Ekadashi Din',
                    body: remoteMessage.notification?.body || '',
                    data: remoteMessage.data,
                },
                trigger: null, 
            });
        });

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background:', remoteMessage);
            
        });

        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage);
                    
                }
            });
    }

    async getNotifications(userId) {
        if (!userId) return [];
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    async markAsRead(notificationId) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notificationId);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead(userId) {
        if (!userId) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('user_id', userId)
                .is('read_at', null);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async updatePreferences(userId, updates) {
        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('notification_preferences')
                .eq('user_id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            const currentPrefs = data?.notification_preferences || {};
            const updatedPrefs = { ...currentPrefs, ...updates };

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ notification_preferences: updatedPrefs })
                .eq('user_id', userId);

            if (updateError) throw updateError;

            await this.syncWithBackend(updatedPrefs);

            return updatedPrefs;
        } catch (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }
    }

    async syncWithBackend(preferences) {
        try {
            await supabase.functions.invoke('schedule-notifications', {
                body: { preferences }
            });
        } catch (error) {
            console.error('Error scheduling notifications via Backend:', error);
        }
    }

    async sendLocalTestNotification() {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Upāsanā 🙏',
                    body: 'This is a test notification. Your notifications are working correctly!',
                    data: { type: 'test' },
                },
                trigger: null,
            });
        } catch (error) {
            console.error('Error sending test notification:', error);
        }
    }
}

export default new NotificationService();
