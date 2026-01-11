
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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
  
  const lines = fileContent.split('\n');
  const dataLines = lines.slice(1).filter(line => line.trim() !== '');

  const expenses = dataLines.map(line => {
    const parts = line.split(','); 
    
    const name = parts[0];
    const amountBgn = parseFloat(parts[1]);
    const categoryRaw = parts[2];
    const category = categoryRaw.split(' (')[0].replace(/"/g, '');
    
    const dateRaw = parts.slice(3).join(',').replace(/"/g, '');
    const date = new Date(dateRaw).toISOString();

    return {
      project_id: 1,
      description: name,
      amount_bgn: amountBgn,
      amount: Math.round((amountBgn / 1.95583) * 100) / 100, // Round to 2 decimals
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
