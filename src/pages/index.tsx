import {useCallback, useEffect, useRef, useState} from 'react';

const DELTA_T = 50;

export default function Home() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const [basisDateTime] = useState(new Date().valueOf());
  const [count, setCount] = useState(basisDateTime);
  const [latestCount, setLatestCount] = useState(basisDateTime);

  const [image1, setImage1] = useState<CanvasImageSource | null>(null);

  const [keyState, setKeyState] = useState<{[keyCode: string]: boolean | undefined}>({});

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
    setImage1(image1);
  }, []);

  // 状態の管理
  const [position, setPosition] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  });

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

    setPosition(current => {
      return {x: current.x + diffX(leftPressed, rightPressed), y: current.y + diffY(upPressed, downPressed)};
    });
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
    if (!ctx1 || !ctx2 || !image1) {
      // throw new Error("context取得失敗");
      return;
    }

    // console.log('rendering', new Date().valueOf() - basisDateTime, basisDateTime, keyState);

    ctx1.clearRect(0, 0, 1200, 900);
    ctx1.drawImage(image1, position.x, position.y, 25, 25);
    const dat = ctx1.getImageData(0, 0, 1200, 900);
    ctx2.putImageData(dat, 0, 0);

    // 黒い長方形を描画する
    // ctx.fillStyle = '#000000';
    // ctx.fillRect(position.x, position.y, ctx.canvas.width / 2, ctx.canvas.height / 2);
  }, [count, basisDateTime, position, setLatestCount, latestCount, image1, keyState]);

  return (
    <div>
      <canvas ref={canvasRef1} width={1200} height={900} hidden />
      <canvas ref={canvasRef2} width={1200} height={900} />
    </div>
  );
}
