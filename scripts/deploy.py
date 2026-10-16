"""Bootstrap deployment; credentials remain outside this project, never logged."""
import json
from pathlib import Path
import sys
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'company-brain/scripts/lib'))
from credential_guard import require_credential

token = require_credential('CLOUDFLARE_API_TOKEN')
account = require_credential('CLOUDFLARE_ACCOUNT_ID')
base = 'https://api.cloudflare.com/client/v4'

def call(path, method='GET', body=None, content_type='application/json'):
    request = urllib.request.Request(base + path, data=body, method=method,
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': content_type})
    with urllib.request.urlopen(request, timeout=30) as response:
        result = json.load(response)
    if not result.get('success'):
        raise RuntimeError('Cloudflare request failed; credentials and response omitted')
    return result['result']

zones = call('/zones?name=oiyo.net')
if len(zones) != 1 or zones[0]['status'] != 'active':
    raise RuntimeError('Expected one active oiyo.net zone')
zone = zones[0]['id']
domains = call(f'/accounts/{account}/workers/domains')
existing = [v for v in domains if v.get('hostname') == 'api.oiyo.net']
if existing and any(v.get('service') != 'oiyo-api' for v in existing):
    raise RuntimeError('Domain belongs to another service; refusing overwrite')
records = call(f'/zones/{zone}/dns_records?name=api.oiyo.net')
if records and not existing:
    raise RuntimeError('Existing DNS record found; refusing replacement')
scripts = call(f'/accounts/{account}/workers/scripts')
# 2026-10-12: first deployment only; subsequent updates need version/rollback review.
if any(v['id'] == 'oiyo-api' for v in scripts):
    raise RuntimeError('Worker already exists; refusing unreviewed redeployment')
boundary = 'oiyo-' + uuid.uuid4().hex
metadata = json.dumps({'main_module': 'worker.mjs', 'compatibility_date': '2026-10-12',
                       'observability': {'enabled': False}}).encode()
body = b''
for name, filename, kind, data in [
    ('metadata', None, 'application/json', metadata),
    ('worker.mjs', 'worker.mjs', 'application/javascript+module', (ROOT / 'src/worker.mjs').read_bytes())]:
    disposition = f'Content-Disposition: form-data; name="{name}"'
    if filename:
        disposition += f'; filename="{filename}"'
    body += f'--{boundary}\r\n{disposition}\r\nContent-Type: {kind}\r\n\r\n'.encode() + data + b'\r\n'
body += f'--{boundary}--\r\n'.encode()
call(f'/accounts/{account}/workers/scripts/oiyo-api', 'PUT', body, 'multipart/form-data; boundary=' + boundary)
print('Worker uploaded: oiyo-api')
call(f'/accounts/{account}/workers/domains', 'PUT', json.dumps({
    'hostname': 'api.oiyo.net', 'service': 'oiyo-api', 'environment': 'production', 'zone_id': zone
}).encode())
print('Custom domain attached: api.oiyo.net')
