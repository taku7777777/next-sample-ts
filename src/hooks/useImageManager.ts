import {MutableRefObject, useCallback, useEffect, useRef} from 'react';

export const useImageManager = (imageState: MutableRefObject<{[key: string]: CanvasImageSource | undefined}>) => {
  // Image List(画像のインスタンスを事前に生成しておき使い回す)
  const pushImages = useCallback(
    (key: string, image: CanvasImageSource) => {
      imageState.current = {...imageState.current, [key]: image};
    },
    [imageState]
  );

  // initialize
  useEffect(() => {
    const image1 = new Image();
    image1.src = '/vercel.svg';
    const image2 = new Image();
    image2.src = '/block.png';
    pushImages('mainCharacter', image1);
    pushImages('block', image2);
  }, [pushImages]);
};
