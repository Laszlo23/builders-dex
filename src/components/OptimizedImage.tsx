import React from 'react';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  /** Hero / LCP images should be eager + high priority */
  priority?: boolean;
};

/** Map any raster path to sibling .webp when applicable */
export function toWebpSrc(src: string): string | null {
  if (!src || src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return null;
  }
  if (/\.webp$/i.test(src)) return src;
  if (/\.(png|jpe?g)$/i.test(src)) return src.replace(/\.(png|jpe?g)$/i, '.webp');
  return null;
}

/** Prefer local WebP with original fallback. Lazy by default. */
export default function OptimizedImage({
  src,
  alt = '',
  className,
  width,
  height,
  priority = false,
  decoding = 'async',
  sizes,
  style,
  onError,
  ...rest
}: Props) {
  const webp = toWebpSrc(src);
  const loading = priority ? 'eager' : rest.loading ?? 'lazy';
  const fetchPriority = priority ? 'high' : rest.fetchPriority;

  const img = (
    <img
      {...rest}
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      sizes={sizes}
      style={style}
      onError={onError}
    />
  );

  if (webp && webp !== src) {
    return (
      <picture>
        <source srcSet={webp} type="image/webp" />
        {img}
      </picture>
    );
  }

  return img;
}
