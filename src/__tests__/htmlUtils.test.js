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
});
