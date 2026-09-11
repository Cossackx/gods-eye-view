"""Extract pinned source attribution records, not a complete feed inventory."""
import collections
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent
WM = pathlib.Path('C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery')
PIN = 'd906869231970005ab3e108ff5321f179e8b7457'
actual = subprocess.check_output(['git', '-C', str(WM), 'rev-parse', 'HEAD'], text=True).strip()
assert actual == PIN, (actual, PIN)
source = 'shared/source-attribution-manifest.json'
data = json.loads((WM / source).read_text(encoding='utf-8'))
entries = data['entries']
counts = collections.Counter(row.get('status', 'unknown') for row in entries)
included = [row for row in entries if row.get('status') != 'excluded']
result = {
    'upstream_commit': PIN,
    'source_path': source,
    'scope': 'Raw source attribution manifest only; hosts/providers are not individual feeds.',
    'complete_feed_inventory': False,
    'counts': {
        'raw_entries': len(entries),
        'status_counts': dict(counts),
        'nonexcluded_hosts': len({row['host'] for row in included}),
        'nonexcluded_provider_labels': len({row['provider'] for row in included}),
        'logical_entries': len(data['logicalEntries']),
        'logical_providers': len(data['logicalProviders']),
    },
    'registry': data,
    'remaining': ['Client/server feed URL reconciliation', 'All variants and layers',
                  'Gods Eye endpoints and datasets', 'Runtime mapping and source rights'],
}
(ROOT / 'worldmonitor-source-manifest.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps(result['counts'], indent=2))
