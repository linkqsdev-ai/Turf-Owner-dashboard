import os

pages = ['Dashboard', 'Turfs', 'Slots', 'Bookings', 'Customers', 'Coupons', 'Analytics', 'Notifications', 'Settings']
os.makedirs('src/pages', exist_ok=True)

for p in pages:
    content = f"""export default function {p}() {{
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-on-surface mb-6">{p}</h1>
      <div className="text-on-surface-variant">Content for {p}</div>
    </div>
  );
}}
"""
    with open(f'src/pages/{p}.tsx', 'w') as f:
        f.write(content)
