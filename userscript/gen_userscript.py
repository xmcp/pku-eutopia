import json
from pathlib import Path
import shutil

#HOST_URL = 'http://127.0.0.1/'
HOST_URL = 'https://xmcp.ltd/pku-eutopia/'

INPUT_DIR = Path('build')

OUTPUT_DIR = Path('userscript/build')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

with (INPUT_DIR / 'asset-manifest.json').open() as f:
    manifest = json.load(f)

js = []
css = []

for fn in manifest['entrypoints']:
    p_src = INPUT_DIR / fn
    if fn.endswith('.js'):
        print('copy js', p_src)
        with p_src.open() as f:
            js.append(f.read())
    elif fn.endswith('.css'):
        print('copy css', p_src)
        with p_src.open() as f:
            css.append(f.read())

with open('userscript/template.js') as f:
    content = f.read()

with (OUTPUT_DIR / 'all.min.js').open('w') as f:
    f.write('\n'.join(js))
with (OUTPUT_DIR / 'all.min.css').open('w') as f:
    f.write('\n'.join(css))

content = (
    content
        .replace(
            '[/* INJECTION POINT: JS FILES */]',
            json.dumps([HOST_URL + 'all.min.js'], indent=4)
        )
        .replace(
            '[/* INJECTION POINT: CSS FILES */]',
            json.dumps([HOST_URL + 'all.min.css'], indent=4)
        )
)

with (OUTPUT_DIR / 'eutopia.user.js').open('w') as f:
    f.write(content)

print('done')