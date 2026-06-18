// Edge TTS — Neural voice synthesis via Microsoft Edge TTS
// Based on github.com/DIYgod/cloudflare-edge-tts (proven Cloudflare Workers implementation)

const READALOUD_BASE = 'speech.platform.bing.com/consumer/speech/synthesize/readaloud';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const SYNTHESIS_URL = `https://${READALOUD_BASE}/edge/v1`;
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const CHROMIUM_MAJOR_VERSION = CHROMIUM_FULL_VERSION.split('.')[0];
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;

const VOICES = {
  'en-IN': 'en-IN-NeerjaNeural',
  'hi-IN': 'hi-IN-MadhurNeural',
};

// ---- Sec-MS-GEC Token (cryptographic handshake required by Microsoft) ----
async function makeSecMsGec() {
  const winEpoch = 11644473600;
  let ticks = Date.now() / 1000;
  ticks += winEpoch;
  ticks -= ticks % 300;           // Round to nearest 5-min window
  ticks *= 1e9 / 100;             // Convert to 100-nanosecond intervals
  const payload = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function makeMuid() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function uuid() { return crypto.randomUUID().replace(/-/g, ''); }
function ts() { return new Date().toISOString().replace(/[-:.]/g, '').slice(0, -1); }

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function configMsg() {
  return `X-Timestamp:${ts()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`;
}

function ssmlMsg(requestId, voice, text) {
  const clean = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ');
  return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts()}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${escapeXml(clean)}</prosody></voice></speak>`;
}

function parseBinary(data) {
  const bytes = new Uint8Array(data);
  if (bytes.length < 2) return null;
  const headerLen = (bytes[0] << 8) | bytes[1];
  if (2 + headerLen > bytes.length) return null;
  const header = new TextDecoder().decode(bytes.slice(2, 2 + headerLen));
  if (!header.includes('Path:audio')) return null;
  // Skip frames with no Content-Type: audio/mpeg and empty body
  if (!header.includes('Content-Type:audio/mpeg') && bytes.length <= 2 + headerLen) return null;
  return bytes.slice(2 + headerLen);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'en-IN';

  if (!text) return Response.json({ error: 'Missing text' }, { status: 400 });
  if (text.length > 500) return Response.json({ error: 'Text too long' }, { status: 400 });

  const voiceName = VOICES[lang] || VOICES['en-IN'];
  const fullVoice = `Microsoft Server Speech Text to Speech Voice (${voiceName.substring(0, 5)}, ${voiceName.split('-').slice(2).join('-')})`;
  const connId = uuid();
  const reqId = uuid();

  try {
    const secMsGec = await makeSecMsGec();

    const wsUrl = new URL(SYNTHESIS_URL);
    wsUrl.searchParams.set('TrustedClientToken', TRUSTED_CLIENT_TOKEN);
    wsUrl.searchParams.set('Sec-MS-GEC', secMsGec);
    wsUrl.searchParams.set('Sec-MS-GEC-Version', SEC_MS_GEC_VERSION);
    wsUrl.searchParams.set('ConnectionId', connId);

    const resp = await fetch(wsUrl.toString(), {
      headers: {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Sec-WebSocket-Version': '13',
        'Upgrade': 'websocket',
        'Cookie': `muid=${makeMuid()};`,
      },
    });

    const ws = resp.webSocket;
    if (!ws) {
      return Response.json({ error: 'WebSocket upgrade failed', status: resp.status }, { status: 502 });
    }

    ws.accept();

    const audioChunks = [];

    const done = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        try { ws.close(); } catch {}
        reject(new Error('timeout'));
      }, 12000);

      ws.addEventListener('message', (evt) => {
        if (typeof evt.data === 'string') {
          // Check for turn.end signal
          if (evt.data.includes('Path:turn.end')) {
            clearTimeout(timer);
            try { ws.close(); } catch {}
            resolve();
          }
        } else {
          // Binary audio frame
          let raw = evt.data;
          if (raw instanceof ArrayBuffer) raw = raw;
          else return;
          const audio = parseBinary(raw);
          if (audio && audio.length > 0) audioChunks.push(audio);
        }
      });

      ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('ws error')); });
      ws.addEventListener('close', () => { clearTimeout(timer); resolve(); });
    });

    // Send config + SSML after accepting
    ws.send(configMsg());
    ws.send(ssmlMsg(reqId, fullVoice, text));

    await done;

    if (audioChunks.length === 0) {
      return Response.json({ error: 'No audio received' }, { status: 500 });
    }

    const total = audioChunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of audioChunks) { out.set(c, off); off += c.length; }

    return new Response(out, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' }
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
