import { spawn } from 'child_process';
import fs from 'fs';

const PANEL_URL = process.env.PANEL_URL || 'https://painel.2goroteiros.com';
const API_URL = 'https://core-api-production-e849.up.railway.app';
const ADMIN_EMAIL = 'admin@2goroteiros.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Senha123*';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Obtendo tokens de admin...');
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await res.json();
  const accessToken = json.data?.accessToken;
  const refreshToken = json.data?.refreshToken;

  console.log('Iniciando Google Chrome headless para captura de tela...');
  const chrome = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      `--user-data-dir=/tmp/chrome-shot-${Date.now()}`,
      '--window-size=1440,900',
    ],
    { stdio: 'ignore' }
  );

  await sleep(2000);

  try {
    const newTabRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
    const tab = await newTabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let idCounter = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = idCounter++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    const panelHost = new URL(PANEL_URL).hostname;
    const isLocalhost = panelHost === 'localhost' || panelHost === '127.0.0.1';

    await send('Network.setCookie', {
      name: 'accessToken',
      value: accessToken,
      domain: isLocalhost ? undefined : panelHost,
      url: isLocalhost ? PANEL_URL : undefined,
      path: '/',
      secure: !isLocalhost,
      httpOnly: false,
    });
    if (refreshToken) {
      await send('Network.setCookie', {
        name: 'refreshToken',
        value: refreshToken,
        domain: isLocalhost ? undefined : panelHost,
        url: isLocalhost ? PANEL_URL : undefined,
        path: '/',
        secure: !isLocalhost,
        httpOnly: false,
      });
    }

    const fullUrl = `${PANEL_URL}/company-expenses`;
    console.log(`Navegando para: ${fullUrl}...`);
    await send('Page.navigate', { url: fullUrl });

    // Esperar carregamento completo dos dados da API
    await sleep(4000);

    console.log('Capturando screenshot...');
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshot.result?.data) {
      const outPath = '/Users/ronilsonbatista/.gemini/antigravity/scratch/company-expenses-ok.png';
      fs.writeFileSync(outPath, Buffer.from(screenshot.result.data, 'base64'));
      console.log(`Screenshot salvo com sucesso em: ${outPath}`);
    } else {
      console.error('Falha ao obter dados da screenshot:', screenshot);
    }

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
