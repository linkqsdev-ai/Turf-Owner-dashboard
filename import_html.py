import os
import re

html_dir = 'stitch_html'
pages_dir = 'src/pages'

mapping = {
    'TurfMaster_Pro_Admin_Dashboard.html': 'Dashboard',
    'Turf_Management.html': 'Turfs',
    'Slot_Management.html': 'Slots',
    'Bookings.html': 'Bookings',
    'Customers.html': 'Customers',
    'Coupons_and_Offers.html': 'Coupons',
    'Analytics_and_Insights.html': 'Analytics',
    'Notifications.html': 'Notifications',
    'Settings.html': 'Settings'
}

for file, component in mapping.items():
    file_path = os.path.join(html_dir, file)
    if not os.path.exists(file_path): 
        print(f"File {file} not found")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if body_match:
        content = body_match.group(1)
        # Remove scripts
        content = re.sub(r'<script.*?>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
        # Escape for template literal
        content = content.replace('`', '\\`').replace('$', '\\$')
        
        comp_code = f"""export default function {component}() {{
  return (
    <div dangerouslySetInnerHTML={{{{ __html: `{content}` }}}} className="h-full w-full" />
  );
}}
"""
        with open(os.path.join(pages_dir, f'{component}.tsx'), 'w', encoding='utf-8') as f:
            f.write(comp_code)
        print(f"Generated {component}.tsx")
