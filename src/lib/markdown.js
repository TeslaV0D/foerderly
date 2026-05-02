import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
});

const ALLOWED_TAGS = [
  'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'strong', 'em', 'b', 'i', 'u', 's', 'del',
  'a', 'blockquote',
  'code', 'pre',
  'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const ALLOWED_ATTR = ['href', 'title', 'src', 'alt', 'rel', 'target', 'class'];

export function renderMarkdownToHtml(md) {
  if (!md) return '';
  const rawHtml = marked.parse(String(md));
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  });
}

export function estimateReadingTime(text) {
  if (!text) return 1;
  const words = String(text).trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function stripMarkdown(md) {
  if (!md) return '';
  return String(md)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
