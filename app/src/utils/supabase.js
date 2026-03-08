import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const CHUNK_SIZE = 2000;
const CHUNK_PREFIX = 'chunked:';

const ExpoSecureStoreAdapter = {
    getItem: async (key) => {
        const value = await SecureStore.getItemAsync(key);
        if (!value) return null;

        if (value.startsWith(CHUNK_PREFIX)) {
            const numChunks = parseInt(value.slice(CHUNK_PREFIX.length), 10);
            let result = '';
            for (let i = 0; i < numChunks; i++) {
                const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
                if (chunk) {
                    result += chunk;
                }
            }
            return result;
        }

        return value;
    },
    setItem: async (key, value) => {
        const oldValue = await SecureStore.getItemAsync(key);
        if (oldValue && oldValue.startsWith(CHUNK_PREFIX)) {
            const numChunks = parseInt(oldValue.slice(CHUNK_PREFIX.length), 10);
            for (let i = 0; i < numChunks; i++) {
                await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
            }
        }

        if (value.length > CHUNK_SIZE) {
            const numChunks = Math.ceil(value.length / CHUNK_SIZE);
            await SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${numChunks}`);
            for (let i = 0; i < numChunks; i++) {
                const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
            }
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    removeItem: async (key) => {
        const value = await SecureStore.getItemAsync(key);
        if (value && value.startsWith(CHUNK_PREFIX)) {
            const numChunks = parseInt(value.slice(CHUNK_PREFIX.length), 10);
            for (let i = 0; i < numChunks; i++) {
                await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
            }
        }
        return SecureStore.deleteItemAsync(key);
    },
};

const supabaseUrl = "https://irgdihkmgeksjemzwhpq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZ2RpaGttZ2Vrc2plbXp3aHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODI0OTksImV4cCI6MjA3MTc1ODQ5OX0.IDzpkFWMToqHG7hZTWUcH-dKARbtdjesammeNGOOHF0";

const storage = Platform.OS === 'web' ? AsyncStorage : ExpoSecureStoreAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

const googleSupabaseUrl = "https://irgdihkmgeksjemzwhpq.supabase.co"
const googleSupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZ2RpaGttZ2Vrc2plbXp3aHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODI0OTksImV4cCI6MjA3MTc1ODQ5OX0.IDzpkFWMToqHG7hZTWUcH-dKARbtdjesammeNGOOHF0"

export const googleSupabase = createClient(googleSupabaseUrl, googleSupabaseAnonKey, {
    auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
