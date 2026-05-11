import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcqcbogfpjtcxbywpvno.supabase.co';
const supabaseAnonKey = 'sb_publishable_MR-r5K9bi4QXtgJ24AuhXQ_f-gZwCIC';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const booking = {
    customer: 'John Doe Test',
    turf: 'Adukalam', // partial match test
    date: '2026-10-24', // Must match the slot I created earlier
    time: '18:00', // start time
    amount: '$45'
  };

  let customerId = null;
  const { data: custData } = await supabase.from('customers').select('id').eq('full_name', booking.customer).maybeSingle();
  if (custData) {
    customerId = custData.id;
  } else {
    const { data: newCust, error: custErr } = await supabase.from('customers').insert({ 
      full_name: booking.customer, 
      email: `${booking.customer.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random()*1000)}@example.com` 
    }).select('id').single();
    console.log('Customer insert result:', newCust, custErr);
    if (newCust && !custErr) customerId = newCust.id;
  }
  
  console.log('customerId:', customerId);

  const { data: turfData, error: turfErr } = await supabase.from('turfs').select('id').ilike('name', `%${booking.turf}%`).maybeSingle();
  console.log('turfData:', turfData, turfErr);
  let slotId = null;
  if (turfData) {
    const times = booking.time.split('-').map(t => t.trim());
    const start_time = times[0] ? `${times[0]}:00` : '00:00:00';
    console.log('searching for slot with start_time:', start_time);
    
    const { data: slotData, error: slotErr } = await supabase.from('slots').select('id')
      .eq('turf_id', turfData.id)
      .eq('slot_date', booking.date)
      .eq('start_time', start_time)
      .maybeSingle();
    
    console.log('slotData:', slotData, slotErr);
    if (slotData) slotId = slotData.id;
  }

  if (customerId && slotId) {
    const amount = parseFloat(booking.amount.replace(/[^0-9.]/g, '')) || 0;
    const ref = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase.from('bookings').insert({
      booking_ref: ref,
      customer_id: customerId,
      slot_id: slotId,
      total_amount: amount,
      status: 'Pending'
    }).select();

    console.log('booking insert result:', data, error);
  } else {
    console.log('failed to prepare booking inserts');
  }
}

test();
