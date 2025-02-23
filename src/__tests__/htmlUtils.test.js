import { renderHtml } from '../htmlUtils.js';

describe('renderHtml', () => {
  test('renders basic HTML text content', () => {
    const html = '<div>Hello world</div>';
    expect(renderHtml(html)).toBe('Hello world');
  });

  test('handles br tags', () => {
    const html = 'First line<br>Second line';
    expect(renderHtml(html)).toBe('First line');
  });

  test('handles block element endings', () => {
    const html = '<p>First paragraph</p><p>Second paragraph</p>';
    expect(renderHtml(html)).toBe('First paragraph');
  });

  test('removes .idiom suffix', () => {
    const html = '<div>Common phrase.idiom</div>';
    expect(renderHtml(html)).toBe('Common phrase');
  });

  test('removes phonetic transcriptions', () => {
    const html = 'Hello /həˈloʊ/ world';
    expect(renderHtml(html)).toBe('Hello world');
  });

  test('extracts first line from multiline content', () => {
    const html = '<div>First line\nSecond line\nThird line</div>';
    expect(renderHtml(html)).toBe('First line');
  });

  test('preserves existing punctuation', () => {
    const html = '<div>Hello world!</div>';
    expect(renderHtml(html)).toBe('Hello world!');
  });

  test('handles complex HTML with multiple features', () => {
    const html = `
      <div>
        <p>Hello /həˈloʊ/ world</p>
        <br>
        <p>Second line.idiom</p>
      </div>
    `;
    expect(renderHtml(html)).toBe('Hello world');
  });

  test('removes multiple phonetic transcriptions from a sentence', () => {
    const html = 'He lost control of his car when a front/rear wheel /wiːl/ hit a rock as he approached the first bend /bend/';
    expect(renderHtml(html)).toBe('He lost control of his car when a front/rear wheel hit a rock as he approached the first bend');
  });

  test('removes phonetic transcription with diacritical marks', () => {
    const html = 'Despite being the underdog /ˈʌndədɒɡ/, the startup managed to disrupt the entire industry with its innovation.';
    expect(renderHtml(html)).toBe('Despite being the underdog , the startup managed to disrupt the entire industry with its innovation.');
  });
});
