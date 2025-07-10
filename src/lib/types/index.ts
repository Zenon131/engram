export interface Engram {
    id: number;
    device_id?: string; // Changed from user_id to device_id, optional since it's added by the service
    title: string;
    content: string;
    createdAt: string;
    cluster?: string;
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null; // To track the current user's vote
}

export interface Database {
    public: {
        Tables: {
            engrams: {
                Row: Engram;
                Insert: Omit<Engram, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>;
                Update: Partial<Omit<Engram, 'id' | 'createdAt'>>;
            };
        };
    };
}