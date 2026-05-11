import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcqcbogfpjtcxbywpvno.supabase.co';
const supabaseAnonKey = 'sb_publishable_MR-r5K9bi4QXtgJ24AuhXQ_f-gZwCIC';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('turfs').insert([{
    name: "Test Turf", 
    type: "Football", 
    location: "Test Location", 
    price_per_hour: 50, 
    image_url: "http://example.com"
  }]).select();
  
  console.log('Turfs Insert Data:', data);
  console.log('Turfs Insert Error:', error);
}

test();
