import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './locationSlice';
import notificationReducer from './notificationSlice';
import readingReducer from './readingSlice';
import themeReducer from './themeSlice';
import userReducer from './userSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        location: locationReducer,
        theme: themeReducer,
        reading: readingReducer,
        notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});
