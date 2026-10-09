import React, { useState, useEffect } from 'react';
import { getImageUrl, fallbackImages } from '../utils/imageUrl';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: keyof typeof fallbackImages;
  alt: string;
}

/**
 * SafeImage component that GUARANTEES images never disappear or get removed.
 * Works seamlessly on GitHub, Netlify, Vercel, Docker, and local development.
 * Automatically recovers from 404s, broken links, network issues, or missing paths
 * by gracefully falling back to bundled assets or SVG illustration.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'default',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => getImageUrl(src, fallbackType));
  const [retryStep, setRetryStep] = useState<number>(0);

  useEffect(() => {
    setCurrentSrc(getImageUrl(src, fallbackType));
    setRetryStep(0);
  }, [src, fallbackType]);

  const handleError = () => {
    if (retryStep === 0) {
      // Step 1: Fallback to the Vite-bundled image asset (physically compiled into JS bundle)
      setRetryStep(1);
      const fallback = fallbackImages[fallbackType] || fallbackImages.default;
      if (fallback && fallback !== currentSrc) {
        setCurrentSrc(fallback);
        return;
      }
    }
    if (retryStep <= 1) {
      // Step 2: Fallback to the general hero burger image
      setRetryStep(2);
      if (fallbackImages.hero && fallbackImages.hero !== currentSrc) {
        setCurrentSrc(fallbackImages.hero);
        return;
      }
    }
    // Step 3: Fallback to an inline SVG fast-food placeholder that NEVER fails
    setRetryStep(3);
    const svgPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23171717"><rect width="600" height="400" fill="%23171717"/><circle cx="300" cy="180" r="70" fill="%23FBBF24" opacity="0.2"/><path d="M260 210 Q300 130 340 210 Z" fill="%23FBBF24"/><rect x="250" y="215" width="100" height="12" rx="6" fill="%23F59E0B"/><rect x="255" y="232" width="90" height="10" rx="5" fill="%23EAB308"/><text x="300" y="290" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23FBBF24" text-anchor="middle">SNACK FUEL</text><text x="300" y="315" font-family="sans-serif" font-size="12" fill="%23A3A3A3" text-anchor="middle">${encodeURIComponent(
      alt || 'Delicious Food'
    )}</text></svg>`;
    setCurrentSrc(svgPlaceholder);
  };

  return (
    <img
      src={currentSrc}
      alt={alt || 'Snack Fuel Food'}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;
