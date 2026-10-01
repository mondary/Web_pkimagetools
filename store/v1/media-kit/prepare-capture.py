"""Build an isolated production-UI fixture, without modifying the app or making API calls."""
from pathlib import Path
import re
import hashlib
import json

root = Path(__file__).resolve().parents[2]
output = root / 'store2' / 'media-kit'
source = root / 'src'
html = (source / 'index.html').read_text()
css = (source / 'style.css').read_text()
js = (source / 'lib/imgralph.js').read_text()
html = re.sub(r'<script\b[^>]*>.*?</script>', '', html, flags=re.S)
html = html.replace('<link rel="stylesheet" href="./style.css" />', '<style>' + css + '</style>')
adapter = r'''
// Fixture only. The ONNX output is an already-transparent generated PNG.
window.ort = { env: { wasm: {} } };
window.RembgWeb = {
  rembgConfig: { setCustomModelPath() {} },
  async newSession() { return {}; },
  async remove(file, { onProgress }) {
    const response = await fetch('../assets/botanical.png');
    if (!response.ok) throw new Error('Fixture PNG unavailable');
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, 480, 480);
    bitmap.close();
    const result = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    onProgress(1);
    return result;
  }
};
'''
init = r'''
const engine = document.querySelector('#engineSelect');
engine.value = 'local';
engine.dispatchEvent(new Event('change'));
document.documentElement.dataset.captureReady = 'true';
'''
label = '<aside style="position:fixed;top:12px;left:12px;z-index:9999;background:#fff;color:#282a25;padding:10px 15px;font:11px Arial;border:1px solid #999;border-radius:4px">INTERFACE DE PRODUCTION · RÉSULTAT SIMULÉ · AUCUN APPEL IA</aside>'
html = html.replace('</body>', label + '<script>' + adapter + '</script><script type="module">' + js + '\n' + init + '</script></body>')
(output / 'production.html').write_text(html)
(output / 'production-sources.json').write_text(json.dumps({
    'scope': 'Actual app HTML/CSS/JS; RembgWeb and ort adapter only. Production crop and matte run unchanged. No inference or API validation.',
    'sources': {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in [source / 'index.html', source / 'style.css', source / 'lib/imgralph.js']}
}, indent=2) + '\n')
print('Production UI fixture generated in store2/media-kit/production.html')
