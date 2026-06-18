// Edge TTS — Free neural voice synthesis via Microsoft's Edge WebSocket
// Adapted for Cloudflare Workers/Pages Functions runtime

const SYNTH_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const VOICES = {
  'en-IN': 'en-IN-NeerjaNeural',
  'hi-IN': 'hi-IN-MadhurNeural',
};

function uuid() {
  return crypto.randomUUID().replace(/-/g, '');
}

function configMsg() {
  return `X-Timestamp:${new Date().toISOString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
}

function ssmlMsg(requestId, text, voice) {
  const e = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toISOString()}\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voice.substring(0, 5)}'><voice name='${voice}'><prosody pitch='+0Hz' rate='-5%' volume='+0%'>${e}</prosody></voice></speak>`;
}

// Extract audio bytes from a binary WebSocket frame
// Edge TTS binary frames: 2-byte big-endian header length, then header string, then audio data
function extractAudio(buf) {
  const bytes = new Uint8Array(buf);
  if (bytes.length < 2) return null;
  // First 2 bytes = header length (big-endian uint16)
  const headerLen = (bytes[0] << 8) | bytes[1];
  if (headerLen + 2 > bytes.length) return null;
  // Verify this is an audio frame by checking header content
  const headerStr = new TextDecoder().decode(bytes.slice(2, 2 + headerLen));
  if (!headerStr.includes('Path:audio')) return null;
  // Everything after the header is audio data
  return bytes.slice(2 + headerLen);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'en-IN';

  if (!text) return new Response('Missing text', { status: 400 });
  if (text.length > 500) return new Response('Text too long', { status: 400 });

  const voice = VOICES[lang] || VOICES['en-IN'];
  const reqId = uuid();

  try {
    // Cloudflare Workers: use fetch() to establish WebSocket
    const wsUrl = `${SYNTH_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${reqId}`;

    const resp = await fetch(wsUrl, {
      headers: {
        'Upgrade': 'websocket',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      },
    });

    const ws = resp.webSocket;
    if (!ws) {
      return new Response(JSON.stringify({ error: 'WebSocket upgrade failed' }), { status: 502 });
    }

    ws.accept();

    const audioChunks = [];

    const done = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        try { ws.close(); } catch {}
        reject(new Error('timeout'));
      }, 15000);

      ws.addEventListener('message', (event) => {
        if (typeof event.data === 'string') {
          if (event.data.includes('Path:turn.end')) {
            clearTimeout(timeout);
            try { ws.close(); } catch {}
            resolve();
          }
        } else {
          // Binary frame — extract audio
          const audio = extractAudio(event.data);
          if (audio && audio.length > 0) {
            audioChunks.push(audio);
          }
        }
      });

      ws.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('ws error'));
      });

      ws.addEventListener('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    // Send config + SSML
    ws.send(configMsg());
    ws.send(ssmlMsg(reqId, text, voice));

    await done;

    if (audioChunks.length === 0) {
      return new Response('No audio', { status: 500 });
    }

    // Concatenate chunks
    const total = audioChunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of audioChunks) { out.set(c, off); off += c.length; }

    return new Response(out, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
