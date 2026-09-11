"""Inventory project documentation/evidence and validate KM frontmatter."""
import datetime
import json
from pathlib import Path
import yaml

root = Path('C:/Users/aleks/Projects/gods-eye-view')
wm = Path('C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery')
vault = Path('C:/Users/aleks/RAZSOC')
records = []
for home, scope in [(root / 'docs', 'canonical-engineering'), (wm / 'docs/discovery', 'temporary-evidence')]:
    if not home.exists():
        continue
    for path in sorted(home.rglob('*')):
        if path.is_file() and path.name != 'DOCUMENT-INVENTORY.json':
            records.append({'path': str(path), 'scope': scope, 'kind': path.suffix,
                            'bytes': path.stat().st_size})
extra = wm / 'BORDER-REPRO.md'
if extra.exists():
    records.append({'path': str(extra), 'scope': 'temporary-evidence', 'kind': '.md', 'bytes': extra.stat().st_size})
km = [vault / 'projects/gods-eye-view.md',
      vault / 'resources/repositories/REPO-gods-eye-view.md',
      vault / 'resources/repositories/REPO-koala73-worldmonitor.md']
for path in km:
    text = path.read_text(encoding='utf-8')
    assert text.startswith('---\n'), path
    props = yaml.safe_load(text.split('---', 2)[1])
    assert props['type'] in ('Project', 'Repository'), path
    assert str(props['updated_on']) == '2026-09-11', path
    assert 'PROJECT-STATUS.md' in text, path
    records.append({'path': str(path), 'scope': 'existing-km-record', 'kind': '.md', 'bytes': path.stat().st_size})
result = {'reconciled_at': datetime.datetime.now().astimezone().isoformat(),
          'scope_note': 'File inventory only. Historical logs/screenshots are retained, not certified as complete acceptance. Upstream docs preserved.',
          'records': records,
          'counts_by_scope': {scope: sum(r['scope'] == scope for r in records) for scope in sorted({r['scope'] for r in records})}}
(root / 'docs/DOCUMENT-INVENTORY.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'counts_by_scope': result['counts_by_scope'], 'km_yaml_validated': len(km)}, indent=2))
