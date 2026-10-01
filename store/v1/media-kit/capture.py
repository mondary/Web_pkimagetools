"""Launch Ego with explicit workspace and TaskSpace config (never assume its cwd/env)."""
from pathlib import Path
import argparse
import json
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--space', type=int, required=True, help='Existing Ego TaskSpace id')
parser.add_argument('--url', default='http://127.0.0.1:4186/store2/')
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
configuration = {'root': str(root), 'spaceId': args.space, 'url': args.url}
script = 'globalThis.store2CaptureConfig = ' + json.dumps(configuration) + ';\n'
script += (Path(__file__).parent / 'capture.mjs').read_text()
subprocess.run(['ego-browser', 'nodejs', '-e', script], check=True)
