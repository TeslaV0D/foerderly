import Link from 'next/link';

export default function Button({
  variant = 'ghost',
  as,
  href,
  children,
  className = '',
  style,
  ...props
}) {
  const cls = `${variant === 'accent' ? 'btn-accent' : 'btn-ghost'} ${className}`.trim();

  if (href) {
    const isExternal = /^https?:\/\//i.test(href);
    if (isExternal) {
      return (
        <a href={href} className={cls} style={style} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} style={style} {...props}>
        {children}
      </Link>
    );
  }

  const Tag = as || 'button';
  return (
    <Tag className={cls} style={style} {...props}>
      {children}
    </Tag>
  );
}
