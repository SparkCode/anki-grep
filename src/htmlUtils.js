import { JSDOM } from 'jsdom';

/**
 * Renders HTML content into plain text while preserving formatting
 * @param {string} html The HTML string to render
 * @returns {string} The rendered text content
 */
export function renderHtml(html) {
  const dom = new JSDOM(html);
  const div = dom.window.document.createElement('div');
  div.innerHTML = html;
  
  // Process HTML and convert to text
  div.innerHTML = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n');
  
  // Get text content and split by newlines
  let lines = (div.textContent || div.innerText || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);
    
  // Get first non-empty line
  let text = lines[0] || '';
  
  // Clean up the text
  text = text
    // Remove .idiom suffix
    .replace(/\.idiom/g, '')
    // First normalize all whitespace to ensure consistent spacing
    .replace(/\s+/g, ' ')
    // Remove phonetic transcriptions that are properly isolated (preserving one space between words)
    .replace(/(\s*)\/[^/]+\/(?=\s|$|[,.!?])/g, '$1')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}
