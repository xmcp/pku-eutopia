import json
from pathlib import Path
import shutil
import datetime
import gzip
import brotli # pip install brotli

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

def save_with_compression(p, content):
    content_b = content.encode('utf-8')
    with open(p, 'wb') as f:
        f.write(content_b)
    with gzip.open(p.with_name(p.name+'.gz'), 'wb') as f:
        f.write(content_b)
    with open(p.with_name(p.name+'.br'), 'wb') as f:
        f.write(brotli.compress(content_b))
    shutil.copystat(p, p.with_name(p.name+'.gz'))
    shutil.copystat(p, p.with_name(p.name+'.br'))

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

save_with_compression(OUTPUT_DIR / f'{BASENAME}.min.js', js)
save_with_compression(OUTPUT_DIR / f'{BASENAME}.min.css', css)

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