// Edge TTS — Neural voice via Microsoft's Edge TTS WebSocket
// Cloudflare Workers: outbound WebSocket via fetch() + Upgrade header

const VOICES = {
  'en-IN': 'en-IN-NeerjaNeural',
  'hi-IN': 'hi-IN-MadhurNeural',
};

function uuid() { return crypto.randomUUID().replace(/-/g, ''); }

function configMsg() {
  return `X-Timestamp:${new Date().toISOString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
}

function ssmlMsg(id, text, voice) {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toISOString()}\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voice.substring(0,5)}'><voice name='${voice}'><prosody pitch='+0Hz' rate='-5%' volume='+0%'>${esc}</prosody></voice></speak>`;
}

function extractAudio(buf) {
  const bytes = new Uint8Array(buf);
  if (bytes.length < 2) return null;
  const headerLen = (bytes[0] << 8) | bytes[1];
  if (2 + headerLen > bytes.length) return null;
  const header = new TextDecoder().decode(bytes.slice(2, 2 + headerLen));
  if (!header.includes('Path:audio')) return null;
  return bytes.slice(2 + headerLen);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'en-IN';

  if (!text) return Response.json({ error: 'Missing text' }, { status: 400 });
  if (text.length > 500) return Response.json({ error: 'Text too long' }, { status: 400 });

  const voice = VOICES[lang] || VOICES['en-IN'];
  const connId = uuid();
  const token = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

  // Cloudflare Workers: use https:// (not wss://) with Upgrade header for outbound WebSocket
  const wsUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${token}&ConnectionId=${connId}`;

  try {
    const resp = await fetch(wsUrl, {
      headers: { 'Upgrade': 'websocket' },
    });

    const ws = resp.webSocket;
    if (!ws) {
      return Response.json({ 
        error: 'WebSocket upgrade failed', 
        status: resp.status,
        statusText: resp.statusText,
      }, { status: 502 });
    }

    ws.accept();

    const audioChunks = [];

    const done = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        try { ws.close(); } catch {}
        reject(new Error('timeout after 12s'));
      }, 12000);

      ws.addEventListener('message', (evt) => {
        if (typeof evt.data === 'string') {
          // Text frame — check for completion signal
          if (evt.data.includes('Path:turn.end')) {
            clearTimeout(timer);
            try { ws.close(); } catch {}
            resolve();
          }
        } else if (evt.data instanceof ArrayBuffer) {
          const audio = extractAudio(evt.data);
          if (audio && audio.length > 0) audioChunks.push(audio);
        }
      });

      ws.addEventListener('error', (e) => {
        clearTimeout(timer);
        reject(new Error('ws error'));
      });

      ws.addEventListener('close', () => {
        clearTimeout(timer);
        resolve();
      });
    });

    // Send config then SSML after connection is accepted
    ws.send(configMsg());
    ws.send(ssmlMsg(connId, text, voice));

    await done;

    if (audioChunks.length === 0) {
      return Response.json({ error: 'No audio chunks received' }, { status: 500 });
    }

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
    return Response.json({ error: e.message, stack: e.stack?.substring(0, 200) }, { status: 500 });
  }
}
