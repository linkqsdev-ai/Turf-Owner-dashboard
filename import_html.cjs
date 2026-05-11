const fs = require('fs');
const path = require('path');

const htmlDir = 'stitch_html';
const pagesDir = 'src/pages';

const mapping = {
    'TurfMaster_Pro_Admin_Dashboard.html': 'Dashboard',
    'Turf_Management.html': 'Turfs',
    'Slot_Management.html': 'Slots',
    'Bookings.html': 'Bookings',
    'Customers.html': 'Customers',
    'Coupons_and_Offers.html': 'Coupons',
    'Analytics_and_Insights.html': 'Analytics',
    'Notifications.html': 'Notifications',
    'Settings.html': 'Settings'
};

for (const [file, component] of Object.entries(mapping)) {
    const filePath = path.join(htmlDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File ${file} not found`);
        continue;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    
    if (bodyMatch) {
        let content = bodyMatch[1];
        content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        content = content.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        
        const compCode = `export default function ${component}() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${content}\` }} className="h-full w-full" />
  );
}
`;
        fs.writeFileSync(path.join(pagesDir, `${component}.tsx`), compCode, 'utf-8');
        console.log(`Generated ${component}.tsx`);
    }
}
