// Edge TTS — Free neural voice synthesis via Microsoft's Edge TTS WebSocket
// Uses standard WebSocket constructor for outbound connection (Cloudflare Workers compatible)

const SYNTH_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const VOICES = {
  'en-IN': 'en-IN-NeerjaNeural',
  'hi-IN': 'hi-IN-MadhurNeural',
};

function uuid() { return crypto.randomUUID().replace(/-/g, ''); }

function configPayload() {
  return `X-Timestamp:${new Date().toISOString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
}

function ssmlPayload(id, text, voice) {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toISOString()}\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voice.substring(0, 5)}'><voice name='${voice}'><prosody pitch='+0Hz' rate='-5%' volume='+0%'>${esc}</prosody></voice></speak>`;
}

function extractAudioFromBinary(buf) {
  const bytes = new Uint8Array(buf);
  if (bytes.length < 2) return null;
  // Edge TTS binary: 2-byte big-endian header length, then header string, then raw audio
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

  if (!text) return new Response('Missing text', { status: 400 });
  if (text.length > 500) return new Response('Text too long', { status: 400 });

  const voice = VOICES[lang] || VOICES['en-IN'];
  const reqId = uuid();

  try {
    const wsUrl = `${SYNTH_URL}?TrustedClientToken=${TOKEN}&ConnectionId=${reqId}`;
    
    // Standard outbound WebSocket — supported in Cloudflare Workers runtime
    const ws = new WebSocket(wsUrl);

    const audioChunks = [];

    const audioData = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { 
        try { ws.close(); } catch {} 
        reject(new Error('timeout')); 
      }, 12000);

      ws.addEventListener('open', () => {
        ws.send(configPayload());
        ws.send(ssmlPayload(reqId, text, voice));
      });

      ws.addEventListener('message', (evt) => {
        if (typeof evt.data === 'string') {
          if (evt.data.includes('Path:turn.end')) {
            clearTimeout(timer);
            try { ws.close(); } catch {}
            resolve(audioChunks);
          }
        } else {
          // Binary message containing audio
          const audio = extractAudioFromBinary(evt.data);
          if (audio && audio.length > 0) audioChunks.push(audio);
        }
      });

      ws.addEventListener('error', () => {
        clearTimeout(timer);
        reject(new Error('WebSocket connection failed'));
      });

      ws.addEventListener('close', () => {
        clearTimeout(timer);
        resolve(audioChunks);
      });
    });

    if (!audioData || audioData.length === 0) {
      return new Response(JSON.stringify({ error: 'No audio generated' }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Merge chunks into single buffer
    const total = audioData.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of audioData) { out.set(c, off); off += c.length; }

    return new Response(out, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
