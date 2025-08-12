import { supabase } from '../services/supabase';

export const checkDatabase = async () => {
  try {
    console.log('Checking database connection and schema...');
    
    // 1. Check if we can connect to Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    console.log('Supabase connection successful');
    
    // 2. Check if tickets table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'tickets' })
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.log('Could not get table info via RPC, trying direct query...');
          return supabase
            .from('tickets')
            .select('*')
            .limit(1);
        }
        return { data, error };
      });

    if (tableError) {
      console.error('Error accessing tickets table:', tableError);
      if (tableError.code === '42P01') { // Table doesn't exist
        console.error('The tickets table does not exist in the database');
      }
    } else {
      console.log('Tickets table structure:', tableInfo);
    }
    
    // 3. Try to insert a test ticket
    const testTicket = {
      eventid: 'test-event-id',
      eventtitle: 'Test Event',
      userid: 'test-user-id',
      username: 'test-user',
      useremail: 'test@example.com',
      quantity: 1,
      totalamount: 0,
      purchasedate: new Date().toISOString(),
      status: 'confirmed',
      ticketcode: 'TEST-' + Math.random().toString(36).substring(2, 10)
    };
    
    console.log('Attempting to insert test ticket...');
    const { data: inserted, error: insertError } = await supabase
      .from('tickets')
      .insert([testTicket])
      .select();
      
    if (insertError) {
      console.error('Error inserting test ticket:', insertError);
    } else {
      console.log('Successfully inserted test ticket:', inserted);
      
      // Clean up test data
      if (inserted?.[0]?.id) {
        await supabase
          .from('tickets')
          .delete()
          .eq('id', inserted[0].id);
        console.log('Cleaned up test ticket');
      }
    }
    
  } catch (error) {
    console.error('Database check failed:', error);
  }
};

// Run the check if this file is executed directly
if (require.main === module) {
  checkDatabase().then(() => {
    console.log('Database check completed');
    process.exit(0);
  });
}
