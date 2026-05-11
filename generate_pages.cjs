const fs = require('fs');
const path = require('path');

const pages = ['Dashboard', 'Turfs', 'Slots', 'Bookings', 'Customers', 'Coupons', 'Analytics', 'Notifications', 'Settings'];
const dir = path.join(__dirname, 'src', 'pages');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

pages.forEach(p => {
    const content = `export default function ${p}() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-on-surface mb-6">${p}</h1>
      <div className="text-on-surface-variant">Content for ${p}</div>
    </div>
  );
}
`;
    fs.writeFileSync(path.join(dir, `${p}.tsx`), content);
});
