// Edge TTS — Free neural voice synthesis via Microsoft's Edge browser TTS WebSocket
// Works on Cloudflare Workers/Pages Functions

const SYNTH_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const VOICES = {
  'en-IN': 'en-IN-NeerjaNeural',
  'hi-IN': 'hi-IN-MadhurNeural',
};

function generateRequestId() {
  return crypto.randomUUID().replace(/-/g, '');
}

function buildConfigMessage(requestId) {
  return `X-Timestamp:${new Date().toISOString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
}

function buildSSMLMessage(requestId, text, voice) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toISOString()}\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voice.substring(0, 5)}'><voice name='${voice}'><prosody pitch='+0Hz' rate='-5%' volume='+0%'>${escaped}</prosody></voice></speak>`;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'en-IN';

  if (!text) return new Response('Missing text parameter', { status: 400 });
  if (text.length > 500) return new Response('Text too long (max 500 chars)', { status: 400 });

  const voice = VOICES[lang] || VOICES['en-IN'];
  const requestId = generateRequestId();

  try {
    const wsUrl = `${SYNTH_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${requestId}`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      }
    });

    const audioChunks = [];
    let resolved = false;

    const audioPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!resolved) { resolved = true; ws.close(); reject(new Error('TTS timeout')); }
      }, 15000);

      ws.addEventListener('open', () => {
        ws.send(buildConfigMessage(requestId));
        ws.send(buildSSMLMessage(requestId, text, voice));
      });

      ws.addEventListener('message', (event) => {
        if (typeof event.data === 'string') {
          if (event.data.includes('Path:turn.end')) {
            clearTimeout(timeout);
            resolved = true;
            ws.close();
            resolve();
          }
        } else {
          // Binary message — extract audio after the header separator
          const processChunk = async (data) => {
            let bytes;
            if (data instanceof ArrayBuffer) {
              bytes = new Uint8Array(data);
            } else if (data instanceof Blob) {
              bytes = new Uint8Array(await data.arrayBuffer());
            } else {
              return;
            }
            // Find the "Path:audio\r\n" header end and extract audio bytes after it
            const headerEnd = findHeaderEnd(bytes);
            if (headerEnd >= 0) {
              audioChunks.push(bytes.slice(headerEnd));
            }
          };
          processChunk(event.data);
        }
      });

      ws.addEventListener('error', (e) => {
        clearTimeout(timeout);
        if (!resolved) { resolved = true; reject(new Error('WebSocket error')); }
      });

      ws.addEventListener('close', () => {
        clearTimeout(timeout);
        if (!resolved) { resolved = true; resolve(); }
      });
    });

    await audioPromise;

    if (audioChunks.length === 0) {
      return new Response('No audio generated', { status: 500 });
    }

    // Concatenate all audio chunks
    const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function findHeaderEnd(bytes) {
  // Look for the double \r\n that separates WebSocket message headers from audio data
  // The header contains "Path:audio\r\n" followed by binary audio
  for (let i = 0; i < bytes.length - 1; i++) {
    if (bytes[i] === 0x00 && bytes[i + 1] === 0x80) {
      // Binary frame header: 2 bytes length prefix + "Path:audio\r\n"
      // Find the actual start of audio data after headers
      const headerStr = new TextDecoder().decode(bytes.slice(0, Math.min(i + 200, bytes.length)));
      const pathIdx = headerStr.indexOf('Path:audio\r\n');
      if (pathIdx >= 0) {
        return pathIdx + 'Path:audio\r\n'.length;
      }
    }
  }
  // Fallback: try to find Path:audio directly
  const str = new TextDecoder().decode(bytes.slice(0, Math.min(500, bytes.length)));
  const idx = str.indexOf('Path:audio\r\n');
  if (idx >= 0) return idx + 'Path:audio\r\n'.length;
  return -1;
}
