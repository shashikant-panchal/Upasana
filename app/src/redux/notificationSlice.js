import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        loading: false,
    },
    reducers: {
        setNotifications: (state, action) => {
            state.items = action.payload;
            state.unreadCount = action.payload.filter(n => !n.read_at).length;
            state.loading = false;
        },
        addNotification: (state, action) => {
            state.items = [action.payload, ...state.items];
            if (!action.payload.read_at) {
                state.unreadCount += 1;
            }
        },
        markAsReadInState: (state, action) => {
            const id = action.payload;
            const item = state.items.find(n => n.id === id);
            if (item && !item.read_at) {
                item.read_at = new Date().toISOString();
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsReadInState: (state) => {
            state.items = state.items.map(n => ({
                ...n,
                read_at: n.read_at || new Date().toISOString()
            }));
            state.unreadCount = 0;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    },
});

export const {
    setNotifications,
    addNotification,
    markAsReadInState,
    markAllAsReadInState,
    setLoading
} = notificationSlice.actions;

export default notificationSlice.reducer;
