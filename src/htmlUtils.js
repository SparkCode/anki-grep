import { JSDOM } from 'jsdom';

/**
 * Renders HTML content into plain text while preserving formatting
 * @param {string} html The HTML string to render
 * @returns {string} The rendered text content
 */
export function renderHtml(html) {
  // Remove leading/trailing quotes if present
  html = html.replace(/^['"]|['"]$/g, '');
  
  const dom = new JSDOM(html);
  const div = dom.window.document.createElement('div');
  
  // Process HTML and convert to text
  div.innerHTML = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''); // Remove style tags and their content
  
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
    // Special handling for phonetic transcription with comma
    .replace(/\/[^/]+\/,/g, ' ,')
    // Remove phonetic transcriptions with their slashes
    // The lookbehind ensures we don't match text like front/rear where / is part of the content
    .replace(/(?<![a-zA-Z]) ?\/[^/]+\/ ?/g, ' ')
    // Fix spacing around punctuation
    .replace(/\s+([.!?])/g, '$1')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}
