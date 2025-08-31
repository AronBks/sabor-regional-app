import React, { useState } from 'react';
import { Image, ImageStyle } from 'react-native';

interface SafeImageProps {
  source: { uri: string };
  style: ImageStyle | ImageStyle[];
  fallbackUrl?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ source, style, fallbackUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const defaultFallback = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';

  const handleError = () => {
    console.log(`❌ Error cargando imagen: ${source.uri}`);
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    console.log(`✅ Imagen cargada exitosamente: ${source.uri}`);
    setIsLoading(false);
  };

  const imageSource = hasError 
    ? { uri: fallbackUrl || defaultFallback }
    : source;

  return (
    <Image
      source={imageSource}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default SafeImage;
