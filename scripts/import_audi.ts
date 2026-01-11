
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importCsv() {
    const filePath = path.join(process.cwd(), 'notion_backup', 'Audi Q8.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Simple CSV parser for this specific format
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');

    const expenses = dataLines.map(line => {
        // Regex to handle potential commas inside quotes (like in the date or category)
        // Format: Name,Amount,Category,Created
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

        // Fallback if regex fails on some lines, though the provided sample looks okay
        const parts = line.split(',');

        // Let's use a more robust split for this specific CSV
        // Name, Amount, Category, Created
        // BGN is in parts[1]
        // Name is parts[0]
        // Category is parts[2]
        // Created is the rest (parts[3] onwards) because of the comma in the date "July 24, 2025..."

        const name = parts[0];
        const amountBgn = parseFloat(parts[1]);
        const categoryRaw = parts[2];
        // Strip notion URL from category: "Buying (https://...)" -> "Buying"
        const category = categoryRaw.split(' (')[0].replace(/"/g, '');

        // Reconstruct date which was split by commas
        const dateRaw = parts.slice(3).join(',').replace(/"/g, '');
        const date = new Date(dateRaw).toISOString();

        return {
            project_id: 1,
            description: name,
            amount_bgn: amountBgn,
            amount: amountBgn / 1.95583, // Assuming 1.95583 is the rate to get EUR
            category: category,
            date: date
        };
    });

    console.log(`Prepared ${expenses.length} expenses to import.`);
    console.log('Sample:', expenses[0]);

    const { data, error } = await supabase
        .from('expense')
        .insert(expenses);

    if (error) {
        console.error('Error importing expenses:', error);
    } else {
        console.log('Successfully imported expenses!');
    }
}

importCsv();
