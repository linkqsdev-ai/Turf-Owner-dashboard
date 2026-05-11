import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcqcbogfpjtcxbywpvno.supabase.co';
const supabaseAnonKey = 'sb_publishable_MR-r5K9bi4QXtgJ24AuhXQ_f-gZwCIC';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: turfs } = await supabase.from('turfs').select('*');
  const { data: slots } = await supabase.from('slots').select('*');
  console.log('Turfs in DB:', turfs);
  console.log('Slots in DB:', slots);
}

test();
