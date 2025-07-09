export interface Engram {
    id: number;
    user_id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface Database {
    public: {
        Tables: {
            engrams: {
                Row: Engram;
                Insert: Omit<Engram, 'id' | 'createdAt'>;
                Update: Partial<Omit<Engram, 'id' | 'createdAt'>>;
            };
        };
    };
}