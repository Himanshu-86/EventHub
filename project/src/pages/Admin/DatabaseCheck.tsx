import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface TableInfo {
  table_name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
  }>;
  row_count?: number;
}

const DatabaseCheck: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testTicket, setTestTicket] = useState<any>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Check connection by getting tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) throw tablesError;
      
      if (!tablesData || tablesData.length === 0) {
        setError('No tables found in the public schema');
        return;
      }

      // 2. Get details for each table
      const tablesInfo: TableInfo[] = [];
      for (const table of tablesData) {
        const tableName = table.table_name;
        
        // Get columns
        const { data: columns, error: colError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', tableName)
          .order('ordinal_position');
          
        if (colError) throw colError;
        
        // Get row count
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
          
        tablesInfo.push({
          table_name: tableName,
          columns: columns || [],
          row_count: count || 0
        });
      }
      
      setTables(tablesInfo);
      
      // 3. Try to insert a test ticket
      if (tablesData.some((t: any) => t.table_name === 'tickets')) {
        const testTicket = {
          eventid: 'test-event-' + Math.random().toString(36).substring(2, 8),
          eventtitle: 'Test Event',
          userid: 'test-user-' + Math.random().toString(36).substring(2, 8),
          username: 'test-user',
          useremail: 'test@example.com',
          quantity: 1,
          totalamount: 0,
          purchasedate: new Date().toISOString(),
          status: 'confirmed',
          ticketcode: 'TEST-' + Math.random().toString(36).substring(2, 10).toUpperCase()
        };
        
        const { data: inserted, error: insertError } = await supabase
          .from('tickets')
          .insert([testTicket])
          .select();
          
        if (!insertError && inserted?.[0]) {
          setTestTicket(inserted[0]);
          
          // Clean up test ticket
          setTimeout(async () => {
            await supabase
              .from('tickets')
              .delete()
              .eq('id', inserted[0].id);
          }, 10000);
        } else if (insertError) {
          console.error('Error inserting test ticket:', insertError);
          setError(`Test ticket insertion failed: ${insertError.message}`);
        }
      }
      
    } catch (err: any) {
      console.error('Database check failed:', err);
      setError(err.message || 'An error occurred while checking the database');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Check</h1>
        <p>Checking database connection and schema...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Check</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {testTicket && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>Success!</strong> Test ticket inserted and will be automatically cleaned up.
          <pre className="mt-2 p-2 bg-white rounded text-sm overflow-auto">
            {JSON.stringify(testTicket, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="space-y-8">
        {tables.map((table) => (
          <div key={table.table_name} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold flex justify-between items-center">
              <span>{table.table_name}</span>
              <span className="text-sm text-gray-600">{table.row_count} rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Column
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nullable
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.columns.map((col) => (
                    <tr key={col.column_name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {col.column_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {col.data_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {col.is_nullable === 'YES' ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseCheck;
