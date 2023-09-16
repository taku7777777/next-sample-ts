import {useCallback, useEffect, useRef, useState} from 'react';

const DELTA_T = 50;

type DrawableUnit = {
  x: number;
  y: number;
  w: number;
  h: number;
  imageKey: string;
};

export default function Home() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  // Time Management
  const [basisDateTime] = useState(new Date().valueOf());
  const [count, setCount] = useState(basisDateTime);
  const [latestCount, setLatestCount] = useState(basisDateTime);

  // ImageLIst
  const [images, setImages] = useState<{[key: string]: CanvasImageSource | undefined}>({});

  // KeyState
  const [keyState, setKeyState] = useState<{[keyCode: string]: boolean | undefined}>({});

  // 状態の管理
  const [drawableUnits, setDrawableUnits] = useState<DrawableUnit[]>([
    {
      x: 0,
      y: 0,
      h: 20,
      w: 30,
      imageKey: 'vercel',
    },
  ]);

  const [position, setPosition] = useState<{x: number; y: number}>({x: 200, y: 100});

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(new Date().valueOf());
    }, DELTA_T);
    // setPosition((current) => ({ x: current.x + 1, y: current.y + 1 }));
    return () => clearInterval(interval);
  }, []);

  const pressFunction = useCallback((event: any) => {
    setKeyState(current => ({...current, [event.keyCode]: true}));
  }, []);
  const escFunction = useCallback((event: any) => {
    setKeyState(current => ({...current, [event.keyCode]: false}));
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', pressFunction, false);
    document.addEventListener('keyup', escFunction, false);
  }, [escFunction, pressFunction]);

  useEffect(() => {
    const image1 = new Image();
    image1.src = '/vercel.svg';
    setImages(() => ({
      ['vercel']: image1,
    }));
  }, []);

  // 一定間隔ごとに処理する
  useEffect(() => {
    if (count <= latestCount) {
      return;
    }
    const delta = count - latestCount;
    setLatestCount(count);

    // 37:←、39:→、38:↑、40:↓
    console.log('processing', delta, position, keyState, keyState['37']);

    const leftPressed = !!keyState['37'];
    const rightPressed = !!keyState['39'];
    const upPressed = !!keyState['38'];
    const downPressed = !!keyState['40'];

    const diffX = (leftPressed: boolean, rightPressed: boolean): number => {
      if (leftPressed && !rightPressed) {
        return -delta * 0.05;
      }
      if (!leftPressed && rightPressed) {
        return delta * 0.05;
      }
      return 0;
    };

    const diffY = (upPressed: boolean, downPressed: boolean): number => {
      if (upPressed && !downPressed) {
        return -delta * 0.05;
      }
      if (!upPressed && downPressed) {
        return delta * 0.05;
      }
      return 0;
    };

    const nextPosition = {
      x: position.x + diffX(leftPressed, rightPressed),
      y: position.y + diffY(upPressed, downPressed),
    };

    setPosition({
      x: nextPosition.x,
      y: nextPosition.y,
    });
    setDrawableUnits([{x: nextPosition.x, y: nextPosition.y, h: 20, w: 30, imageKey: 'vercel'}]);
  }, [count, basisDateTime, position, setLatestCount, latestCount, keyState]);

  // 一定間隔ごとに描画する
  useEffect(() => {
    if (count <= latestCount) {
      return;
    }
    setLatestCount(count);
    if (!canvasRef1.current || !canvasRef2.current) {
      // throw new Error("objectがnull");
      return;
    }

    const canvas1 = canvasRef1.current;
    const canvas2 = canvasRef2.current;
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    // const image1 = images[0];
    if (!ctx1 || !ctx2) {
      // throw new Error("context取得失敗");
      return;
    }

    console.log('drawableUnits', drawableUnits);

    ctx1.clearRect(0, 0, 1200, 900);
    drawableUnits.map(unit => {
      const image = images[unit.imageKey];
      if (!image) {
        console.warn('there is no error', unit.imageKey, images);
        return;
      }
      ctx1.drawImage(image, unit.x, unit.y, unit.w, unit.h);
    });
    const dat = ctx1.getImageData(0, 0, 1200, 900);
    ctx2.putImageData(dat, 0, 0);

    // 黒い長方形を描画する
    // ctx.fillStyle = '#000000';
    // ctx.fillRect(position.x, position.y, ctx.canvas.width / 2, ctx.canvas.height / 2);
  }, [count, basisDateTime, position, setLatestCount, latestCount, images, keyState, drawableUnits]);

  return (
    <div>
      <canvas ref={canvasRef1} width={1200} height={900} hidden />
      <canvas ref={canvasRef2} width={1200} height={900} />
    </div>
  );
}
