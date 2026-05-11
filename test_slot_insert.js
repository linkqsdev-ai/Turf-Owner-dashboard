import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcqcbogfpjtcxbywpvno.supabase.co';
const supabaseAnonKey = 'sb_publishable_MR-r5K9bi4QXtgJ24AuhXQ_f-gZwCIC';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const slotInfo = {
    turf: 'Adukalam Turf',
    date: '2026-10-24',
    time: '18:00 - 19:00',
    price: '$45'
  };

  const { data: turfData, error: turfErr } = await supabase.from('turfs').select('id').eq('name', slotInfo.turf).single();
  console.log('Turf Data:', turfData, 'Error:', turfErr);
      
  if (turfData) {
    const times = slotInfo.time.split('-').map(t => t.trim());
    const start_time = times[0] ? `${times[0]}:00` : '00:00:00';
    const end_time = times[1] ? `${times[1]}:00` : (times[0] ? `${times[0].substring(0,2)}:59:59` : '23:59:59');
    const price = parseFloat(slotInfo.price.replace(/[^0-9.]/g, '')) || 0;

    const { data, error } = await supabase.from('slots').insert({
      turf_id: turfData.id,
      slot_date: slotInfo.date,
      start_time,
      end_time,
      price,
      is_booked: false
    }).select();

    console.log('Insert Result:', data, 'Error:', error);
  }
}

test();
