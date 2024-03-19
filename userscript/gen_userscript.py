import json
from pathlib import Path
import shutil
import datetime
import gzip

#HOST_URL = 'http://127.0.0.1/'
HOST_URL = 'https://xmcp.ltd/pku-eutopia/'

INPUT_DIR = Path('dist')

OUTPUT_DIR = Path('userscript/build')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
BASENAME = 'all-v2'
BUILD_INFO_MARKER = '{-{-BUILD_INFO-}-}'

def add_build_info(s):
    info = datetime.datetime.now().strftime('%y%m%d.%H%M')
    assert s.count(BUILD_INFO_MARKER) == 1
    print('build info:', info)
    return s.replace(BUILD_INFO_MARKER, info)

def wrap_js(s):
    # wrap js code in iife to avoid polluting global namespace
    return '(()=>{%s})()'%s

js = []
css = []

for p_src in INPUT_DIR.glob('assets/*.js'):
    print('copy js', p_src)
    with p_src.open(encoding='utf-8') as f:
        js.append(f.read())
for p_src in INPUT_DIR.glob('assets/*.css'):
    print('copy css', p_src)
    with p_src.open(encoding='utf-8') as f:
        css.append(f.read())

with open('userscript/template.js') as f:
    content = f.read()

js = wrap_js(add_build_info('\n'.join(js)))
css = '\n'.join(css)

with open(OUTPUT_DIR / f'{BASENAME}.min.js', 'w', encoding='utf-8') as f:
    f.write(js)
with gzip.open(OUTPUT_DIR / f'{BASENAME}.min.js.gz', 'wb') as f:
    f.write(js.encode('utf-8'))
shutil.copystat(OUTPUT_DIR / f'{BASENAME}.min.js', OUTPUT_DIR / f'{BASENAME}.min.js.gz')

with open(OUTPUT_DIR / f'{BASENAME}.min.css', 'w', encoding='utf-8') as f:
    f.write(css)
with gzip.open(OUTPUT_DIR / f'{BASENAME}.min.css.gz', 'wb') as f:
    f.write(css.encode('utf-8'))
shutil.copystat(OUTPUT_DIR / f'{BASENAME}.min.css', OUTPUT_DIR / f'{BASENAME}.min.css.gz')

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