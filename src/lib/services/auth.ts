import { supabase } from '$lib/services/supabase.js';


export const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        throw error;
    }

    return data;
}

export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw error;
    }

    return data;
}

export const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export const getSesh = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session;
}

