import { renderMarkdownToHtml } from '@/lib/markdown';

export default function BlogContent({ content }) {
  const html = renderMarkdownToHtml(content || '');
  return (
    <>
      <style>{`
        .blog-content { font-size: 17px; line-height: 1.75; color: var(--text); max-width: 750px; }
        .blog-content > * + * { margin-top: 1.1em; }
        .blog-content h2 { font-size: 28px; font-weight: 700; letter-spacing: -0.6px; margin-top: 1.8em; line-height: 1.25; }
        .blog-content h3 { font-size: 22px; font-weight: 700; letter-spacing: -0.4px; margin-top: 1.6em; line-height: 1.3; }
        .blog-content h4 { font-size: 18px; font-weight: 700; margin-top: 1.4em; }
        .blog-content p { color: color-mix(in oklch, var(--text) 88%, transparent); }
        .blog-content a { color: var(--accent); text-decoration: none; border-bottom: 1px solid color-mix(in oklch, var(--accent) 40%, transparent); transition: border-color 0.2s; }
        .blog-content a:hover { border-bottom-color: var(--accent); }
        .blog-content ul, .blog-content ol { padding-left: 1.4em; }
        .blog-content li { margin: 0.4em 0; }
        .blog-content strong { color: var(--text); font-weight: 700; }
        .blog-content blockquote { border-left: 3px solid var(--accent); padding: 8px 16px; background: var(--bg2); border-radius: 0 8px 8px 0; color: var(--muted); font-style: italic; }
        .blog-content code { background: var(--bg3); border: 1px solid var(--border2); border-radius: 6px; padding: 2px 6px; font-size: 0.9em; font-family: ui-monospace, "SF Mono", Menlo, monospace; }
        .blog-content pre { background: var(--bg2); border: 1px solid var(--border2); border-radius: 12px; padding: 16px 20px; overflow-x: auto; }
        .blog-content pre code { background: transparent; border: 0; padding: 0; font-size: 13px; line-height: 1.6; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--border2); margin: 1em 0; }
        .blog-content hr { border: 0; height: 1px; background: var(--border2); margin: 2em 0; }
        .blog-content table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .blog-content th, .blog-content td { border: 1px solid var(--border2); padding: 8px 12px; text-align: left; }
        .blog-content th { background: var(--bg2); font-weight: 600; }
      `}</style>
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
