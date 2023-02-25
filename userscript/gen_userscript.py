import json
from pathlib import Path
import shutil
import datetime

#HOST_URL = 'http://127.0.0.1/'
HOST_URL = 'https://xmcp.ltd/pku-eutopia/'

INPUT_DIR = Path('build')

OUTPUT_DIR = Path('userscript/build')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
BASENAME = 'all-v2'
BUILD_INFO_MARKER = '{-{-BUILD_INFO-}-}'

with (INPUT_DIR / 'asset-manifest.json').open() as f:
    manifest = json.load(f)

def add_build_info(s):
    info = datetime.datetime.now().strftime('%y%m%d.%H%M')
    assert s.count(BUILD_INFO_MARKER) == 1
    print('build info:', info)
    return s.replace(BUILD_INFO_MARKER, info)

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

js = add_build_info('\n'.join(js))
css = '\n'.join(css)

with (OUTPUT_DIR / f'{BASENAME}.min.js').open('w') as f:
    f.write(js)
with (OUTPUT_DIR / f'{BASENAME}.min.css').open('w') as f:
    f.write(css)

content = (
    content
        .replace(
            '[/* INJECTION POINT: JS FILES */]',
            json.dumps([HOST_URL + f'{BASENAME}.min.js'], indent=4)
        )
        .replace(
            '[/* INJECTION POINT: CSS FILES */]',
            json.dumps([HOST_URL + f'{BASENAME}.min.css'], indent=4)
        )
)

with (OUTPUT_DIR / 'eutopia.user.js').open('w') as f:
    f.write(content)

print('done')