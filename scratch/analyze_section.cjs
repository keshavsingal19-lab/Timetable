const fs = require('fs');
const html = fs.readFileSync('scratch/BCH_J_IV.html', 'utf-8');

// Find the heading area
const headingMatch = html.match(/<table[^>]*id="print_heading"[^>]*>([\s\S]*?)<\/table>/i);
if (headingMatch) {
  const heading = headingMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('Heading:', heading);
}

// Find the timetable table and extract Monday row as sample
const dayRegex = /<td[^>]*>\s*Monday\s*<\/td>([\s\S]*?)(?:<\/tr>)/i;
const monMatch = html.match(dayRegex);
if (monMatch) {
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let m, col = 0;
  while ((m = tdRegex.exec(monMatch[1])) !== null) {
    const text = m[0]
      .replace(/<span[^>]*>[^<]*<\/span>/gi, '[TYPE]')
      .replace(/<br\s*\/?>/gi, ' | ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length > 2) {
      const colspanMatch = m[0].match(/colspan\s*=\s*"?(\d+)"?/i);
      const cs = colspanMatch ? ' (colspan=' + colspanMatch[1] + ')' : '';
      console.log('Mon col ' + col + cs + ':', text);
    }
    col++;
  }
}

// Extract Tuesday 10:30 slot too
const tueRegex = /<td[^>]*>\s*Tuesday\s*<\/td>([\s\S]*?)(?:<\/tr>)/i;
const tueMatch = html.match(tueRegex);
if (tueMatch) {
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let m, col = 0;
  while ((m = tdRegex.exec(tueMatch[1])) !== null) {
    const text = m[0]
      .replace(/<span[^>]*>[^<]*<\/span>/gi, '[TYPE]')
      .replace(/<br\s*\/?>/gi, ' | ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length > 2) {
      const colspanMatch = m[0].match(/colspan\s*=\s*"?(\d+)"?/i);
      const cs = colspanMatch ? ' (colspan=' + colspanMatch[1] + ')' : '';
      console.log('Tue col ' + col + cs + ':', text);
    }
    col++;
  }
}

// Also check the legend at the bottom
const legendRegex = /<div[^>]*class="[^"]*w98[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
const legMatch = html.match(legendRegex);
if (legMatch) {
  const legend = legMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  console.log('\nLegend:', legend.substring(0, 500));
}

// Check what the page title area says about section
const titleArea = html.substring(0, 5000);
const sectionMatch = titleArea.match(/Section\s*:\s*([A-Z0-9]+)/i);
const classMatch = titleArea.match(/Class\s*:\s*([^\n<]+)/i);
const semMatch = titleArea.match(/Sem[a-z]*\s*:\s*([^\n<]+)/i);
console.log('\nSection:', sectionMatch?.[1] || 'not found');
console.log('Class:', classMatch?.[1] || 'not found');
console.log('Semester:', semMatch?.[1] || 'not found');

// Look for any identifying text in the first table
const firstTableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
if (firstTableMatch) {
  const text = firstTableMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('\nFirst table text:', text.substring(0, 300));
}
