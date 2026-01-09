export interface Project {
    id: number;
    name: string;
    type: string;
    description?: string;
    image_path?: string;
    is_deleted?: boolean;
    created_at: string;
    user_id?: string;
    sold_price?: number;
    status?: 'active' | 'completed';
    buy_price?: number;
    odometer?: number;
    odometer_end?: number;
    vin?: string;
}

export interface Expense {
    id: number;
    project_id: number;
    amount: number;
    amount_bgn?: number;
    description: string;
    category?: string;
    date: string;
}
