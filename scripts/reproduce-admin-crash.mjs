import { spawn } from 'child_process';

const PANEL_URL = process.env.PANEL_URL || 'https://painel.2goroteiros.com';
const API_URL = 'https://core-api-production-e849.up.railway.app';
const ADMIN_EMAIL = 'admin@2goroteiros.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Senha123*';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAuthTokens() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await res.json();
  return {
    accessToken: json.data?.accessToken,
    refreshToken: json.data?.refreshToken,
  };
}

async function main() {
  console.log('Obtendo tokens de admin...');
  const { accessToken, refreshToken } = await getAuthTokens();
  if (!accessToken) {
    throw new Error('Falha ao autenticar admin');
  }
  console.log('Tokens obtidos com sucesso.');

  // Iniciar Chrome headless
  console.log('Iniciando Google Chrome headless...');
  const chrome = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      '--disable-web-security',
      `--user-data-dir=/tmp/chrome-test-${Date.now()}`,
      '--window-size=1440,900',
    ],
    { stdio: 'ignore' }
  );

  await sleep(2000);

  try {
    // Pegar target WebSocket
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await versionRes.json();
    console.log('Chrome conectado:', versionData.Browser);

    const newTabRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
    const tab = await newTabRes.json();
    console.log('Nova aba criada:', tab.id);

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let idCounter = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('\n>>> RUNTIME EXCEPTION CAPTURED:');
        console.error(JSON.stringify(msg.params.exceptionDetails, null, 2));
      }
      if (msg.method === 'Console.messageAdded') {
        const { level, text, url, line } = msg.params.message;
        if (level === 'error' || level === 'warning') {
          console.log(`[CONSOLE ${level.toUpperCase()}] ${text} (${url}:${line})`);
        }
      }
      if (msg.method === 'Network.responseReceived') {
        const { response } = msg.params;
        if (response.status >= 400) {
          console.warn(`[HTTP ${response.status}] ${response.url}`);
        }
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

    // Habilitar domínios CDP
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Console.enable');

    // Injetar cookies no domínio do painel
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

    // Rotas para auditar
    const routesToTest = [
      '/dashboard',
      '/company-expenses',
      '/users',
      '/customers',
      '/leads',
      '/trips',
      '/itinerary-editor',
      '/base-trips',
      '/billing',
      '/marketing',
      '/analytics',
      '/blog',
      '/intelligence',
      '/system',
      '/settings',
      '/media',
    ];

    console.log('\n========================================================================');
    console.log('AUDITORIA DE ROTAS EM PRODUÇÃO (PAINEL.2GOROTEIROS.COM)');
    console.log('========================================================================');

    for (const route of routesToTest) {
      const fullUrl = `${PANEL_URL}${route}`;
      console.log(`\nTestando navegação para: ${fullUrl}...`);
      await send('Page.navigate', { url: fullUrl });

      // Esperar renderização da página
      await sleep(3500);

      // Avaliar o DOM para verificar se caiu na tela de erro
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const bodyText = document.body ? document.body.innerText : '';
          const hasError = bodyText.includes("This page couldn’t load") || bodyText.includes("This page couldn't load");
          const hasReloadBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Reload'));
          const h1Text = document.querySelector('h1') ? document.querySelector('h1').innerText : '';
          const title = document.title;
          return {
            hasError,
            hasReloadBtn,
            h1Text,
            title,
            bodySnippet: bodyText.slice(0, 300).replace(/\\n+/g, ' ')
          };
        })()`,
        returnByValue: true,
      });

      const resVal = evalRes.result?.value || {};
      const snippet = resVal.bodySnippet || '';
      if (resVal.hasError) {
        console.error(`[FAIL] ${route} -> CRASH ("This page couldn't load")`);
        console.error(`  Snippet: ${snippet}`);

        // Capture screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        if (screenshot.data) {
          const fs = await import('fs');
          const filename = `/Users/ronilsonbatista/.gemini/antigravity/scratch/crash-${route.replace(/[\/-]/g, '_')}.png`;
          fs.writeFileSync(filename, Buffer.from(screenshot.data, 'base64'));
          console.log(`  Screenshot salvo em: ${filename}`);
        }
      } else {
        console.log(`[PASS] ${route} -> Carregou com sucesso! H1: "${resVal.h1Text || ''}"`);
        console.log(`  Snippet: ${snippet.slice(0, 100)}...`);
      }
    }

    ws.close();
  } finally {
    chrome.kill();
    console.log('\nProcesso do Chrome encerrado.');
  }
}

main().catch((err) => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
