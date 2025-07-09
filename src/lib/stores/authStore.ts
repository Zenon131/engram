import { writable } from 'svelte/store';
import { supabase } from '$lib/services/supabase.js';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const isLoading = writable<boolean>(true);

export const initializeAuth = async () => {
    supabase.auth.onAuthStateChange((event, session) => {
        user.set(session?.user ?? null);
        isLoading.set(false);
    });

    const { data } = await supabase.auth.getSession();
    user.set(data.session?.user ?? null);
    isLoading.set(false);
};


