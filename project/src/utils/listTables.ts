import { supabase } from '../services/supabase';

async function listTables() {
  try {
    console.log('Fetching database tables...');
    
    // Get all tables using the information_schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');
    
    if (error) throw error;
    
    console.log('\n=== Database Tables ===');
    if (data && data.length > 0) {
      for (const table of data) {
        console.log(`\nTable: ${table.table_name}`);
        
        // Get table columns
        const { data: columns, error: colError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', table.table_name)
          .order('ordinal_position');
          
        if (colError) {
          console.error(`  Error getting columns: ${colError.message}`);
          continue;
        }
        
        console.log('  Columns:');
        columns?.forEach(col => {
          console.log(`    - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      }
    } else {
      console.log('No tables found in the public schema');
    }
    
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

// Run the function
listTables().then(() => {
  console.log('\nTable listing completed');  
  process.exit(0);
});
