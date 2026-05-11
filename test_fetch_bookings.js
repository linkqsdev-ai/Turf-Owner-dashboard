import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcqcbogfpjtcxbywpvno.supabase.co';
const supabaseAnonKey = 'sb_publishable_MR-r5K9bi4QXtgJ24AuhXQ_f-gZwCIC';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: bookings, error } = await supabase.from('bookings').select('*, customers(full_name), slots(slot_date, start_time, end_time, turfs(name))');
  console.log('Bookings in DB:', JSON.stringify(bookings, null, 2));
  console.log('Error:', error);
}

test();
