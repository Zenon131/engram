import { supabase } from './supabase.js';
import type { Engram } from '$lib/types/index.js';
import { browser } from '$app/environment';

// Function to get or create a device ID for anonymous use
function getDeviceId(): string {
    if (!browser) return 'server';
    
    let deviceId = localStorage.getItem('bulletin_device_id');
    
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
        localStorage.setItem('bulletin_device_id', deviceId);
    }
    
    return deviceId;
}

// Define vote interface
interface Vote {
    id: number;
    engram_id: number;
    device_id: string; // Changed from user_id to device_id
    vote_type: 'up' | 'down';
    created_at: string;
}

// Define extended Supabase Engram type with votes
interface SupabaseEngram {
    id: number;
    title: string;
    content: string;
    device_id: string | null; // Changed from user_id to device_id
    cluster?: string;
    upvotes: number;
    downvotes: number;
    created_at: string;
    votes?: Vote[];
}

/**
 * Service for handling Engram data operations via Supabase
 */
export const supabaseService = {
    /**
     * Fetches all engrams from Supabase
     * @param cluster Optional cluster filter
     */
    async getEngrams(cluster?: string): Promise<Engram[]> {
        let query = supabase
            .from('engrams')
            .select('*, votes!votes_engram_id_fkey(*)');

        // Filter by cluster if provided
        if (cluster && cluster !== 'all') {
            query = query.eq('cluster', cluster);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching engrams:', error);
            return [];
        }

        // Get the current device ID for anonymous identification
        const deviceId = getDeviceId();

        // Map the data to include the userVote field
        const engrams = data.map((engram) => {
                // Find the device's vote if it exists
                const userVote = engram.votes?.find((vote: Vote) => vote.device_id === deviceId)?.vote_type || null;
                
            return {
                id: engram.id,
                title: engram.title,
                content: engram.content,
                device_id: engram.device_id,
                cluster: engram.cluster || 'general',
                upvotes: engram.upvotes || 0,
                downvotes: engram.downvotes || 0,
                createdAt: engram.created_at,
                userVote
            };
        });

        return engrams;
    },

    /**
     * Fetches a single engram by ID
     */
    async getEngram(id: number): Promise<Engram | null> {
        const { data, error } = await supabase
            .from('engrams')
            .select('*, votes!votes_engram_id_fkey(*)')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error fetching engram:', error);
            return null;
        }

        // Get the current device ID for anonymous identification
        const deviceId = getDeviceId();
        
        // Find this device's vote if it exists
        const userVote = data.votes?.find((vote: Vote) => vote.device_id === deviceId)?.vote_type || null;

        return {
            id: data.id,
            title: data.title,
            content: data.content,
            device_id: data.device_id,
            cluster: data.cluster || 'general',
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            createdAt: data.created_at,
            userVote
        };
    },

    /**
     * Adds a new engram
     */
    async addEngram({ 
        title, 
        content, 
        cluster = 'general' 
    }: { 
        title: string; 
        content: string; 
        cluster?: string; 
    }): Promise<Engram | null> {
        // Get device ID for anonymous posting
        const deviceId = getDeviceId();
        
        // Prepare the insert data
        const insertData = {
            title,
            content,
            cluster,
            device_id: deviceId,
            upvotes: 0,
            downvotes: 0
        };

        const { data, error } = await supabase
            .from('engrams')
            .insert(insertData)
            .select()
            .single();

        if (error || !data) {
            console.error('Error adding engram:', error);
            return null;
        }

        // Map to Engram type
        return {
            id: data.id,
            title: data.title,
            content: data.content,
            device_id: data.device_id,
            cluster: data.cluster || 'general',
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            createdAt: data.created_at,
            userVote: null
        };
    },

    /**
     * Updates an existing engram
     */
    async updateEngram(
        id: number, 
        { 
            title, 
            content, 
            cluster 
        }: { 
            title?: string; 
            content?: string; 
            cluster?: string; 
        }
    ): Promise<Engram | null> {
        const updateData: Record<string, string> = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (cluster !== undefined) updateData.cluster = cluster;

        const { data, error } = await supabase
            .from('engrams')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            console.error('Error updating engram:', error);
            return null;
        }

        // Get the current device ID
        const deviceId = getDeviceId();

        // Get this device's vote if it exists
        let userVote = null;
        const { data: voteData } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('engram_id', id)
            .eq('device_id', deviceId)
            .single();
        
        userVote = voteData?.vote_type || null;

        // Map to Engram type
        return {
            id: data.id,
            title: data.title,
            content: data.content,
            device_id: data.device_id,
            cluster: data.cluster || 'general',
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            createdAt: data.created_at,
            userVote
        };
    },

    /**
     * Deletes an engram by ID
     */
    async deleteEngram(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('engrams')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting engram:', error);
            return false;
        }

        return true;
    },

    /**
     * Vote on an engram (upvote or downvote)
     */
    async voteEngram(id: number, direction: 'up' | 'down'): Promise<Engram | null> {
        // Get the current device ID for anonymous voting
        const deviceId = getDeviceId();

        // Get current engram to check vote status
        const { data: currentEngram, error: fetchError } = await supabase
            .from('engrams')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !currentEngram) {
            console.error('Error fetching engram for voting:', fetchError);
            return null;
        }

        // Check if this device has already voted
        const { data: existingVote } = await supabase
            .from('votes')
            .select('*')
            .eq('engram_id', id)
            .eq('device_id', deviceId)
            .single();

        // Begin transaction to update votes
        let updateFields: Record<string, number | { upvotes: number; downvotes: number }> = {};
        let userVote: 'up' | 'down' | null = direction;

        if (!existingVote) {
            // No previous vote, add a new one
            const { error: voteError } = await supabase
                .from('votes')
                .insert({
                    engram_id: id,
                    device_id: deviceId,
                    vote_type: direction
                });

            if (voteError) {
                console.error('Error adding vote:', voteError);
                return null;
            }

            // Update engram vote counts
            updateFields = direction === 'up'
                ? { upvotes: (currentEngram.upvotes || 0) + 1 }
                : { downvotes: (currentEngram.downvotes || 0) + 1 };
        } 
        else if (existingVote.vote_type === direction) {
            // Device is toggling their vote off
            const { error: deleteError } = await supabase
                .from('votes')
                .delete()
                .eq('engram_id', id)
                .eq('device_id', deviceId);

            if (deleteError) {
                console.error('Error removing vote:', deleteError);
                return null;
            }

            // Update engram vote counts
            updateFields = direction === 'up'
                ? { upvotes: Math.max(0, (currentEngram.upvotes || 0) - 1) }
                : { downvotes: Math.max(0, (currentEngram.downvotes || 0) - 1) };
                
            userVote = null;
        } 
        else {
            // Device is changing their vote from up to down or vice versa
            const { error: updateError } = await supabase
                .from('votes')
                .update({ vote_type: direction })
                .eq('engram_id', id)
                .eq('device_id', deviceId);

            if (updateError) {
                console.error('Error updating vote:', updateError);
                return null;
            }

            // Update engram vote counts
            updateFields = direction === 'up'
                ? { 
                    upvotes: (currentEngram.upvotes || 0) + 1,
                    downvotes: Math.max(0, (currentEngram.downvotes || 0) - 1)
                }
                : {
                    upvotes: Math.max(0, (currentEngram.upvotes || 0) - 1),
                    downvotes: (currentEngram.downvotes || 0) + 1
                };
        }

        // Update the engram with new vote counts
        const { data: updatedEngram, error: updateError } = await supabase
            .from('engrams')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating engram votes:', updateError);
            return null;
        }

        // Return the updated engram with device vote
        return {
            id: updatedEngram.id,
            title: updatedEngram.title,
            content: updatedEngram.content,
            device_id: updatedEngram.device_id,
            cluster: updatedEngram.cluster || 'general',
            upvotes: updatedEngram.upvotes || 0,
            downvotes: updatedEngram.downvotes || 0,
            createdAt: updatedEngram.created_at,
            userVote
        };
    }
};
