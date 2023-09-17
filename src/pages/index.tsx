import {KeyState} from '@/shared/keyState';
import {KeyType} from '@/shared/keyType';
import {ObjectUtils} from '@/shared/objectUtils';
import {useCallback, useEffect, useRef, useState} from 'react';

const DELTA_T = 50;

type DrawableUnit = {
  x: number;
  y: number;
  w: number;
  h: number;
  imageKey: string;
};

type Character = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  key: 'mainCharacter';
};

// 監視する必要のあるすべてのキーの状態
type AllKeyState = {
  [key in KeyType]: KeyState;
};

export default function Home() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  // Time Management
  const [startTime] = useState(new Date().valueOf());
  const [latestIntervalTime, setLatestIntervalTime] = useState(startTime);
  const [latestCalcTime, setLatestCalcTime] = useState(startTime);

  // Image List(画像のインスタンスを事前に生成しておき使い回す)
  const [images, setImages] = useState<{[key: string]: CanvasImageSource | undefined}>({});

  // Key State
  const [keyState, setKeyState] = useState<AllKeyState>(
    ObjectUtils.fromEntries(KeyType.values().map(key => [key, KeyState.notPressed]))
  );

  // 状態の管理
  const [drawableUnits, setDrawableUnits] = useState<DrawableUnit[]>([
    {
      x: 0,
      y: 0,
      h: 20,
      w: 30,
      imageKey: 'mainCharacter',
    },
  ]);

  const [mainCharacter, setMainCharacter] = useState<Character | undefined>(undefined);

  const [position, setPosition] = useState<{x: number; y: number}>({x: 200, y: 100});

  useEffect(() => {
    const interval = setInterval(() => {
      setLatestIntervalTime(new Date().valueOf());
    }, DELTA_T);
    // setPosition((current) => ({ x: current.x + 1, y: current.y + 1 }));
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // initialize
    setMainCharacter({x: 200, y: 200, vx: 0, vy: 0, ax: 0, ay: 0, key: 'mainCharacter'});
  }, []);

  const updateKeyState = useCallback(
    (state: KeyState) => (event: any) => {
      try {
        const keyEventIndex = Number(event.keyCode);
        const keyType = KeyType.fromKeyEventIndex(keyEventIndex);
        if (!keyType) {
          return;
        }

        setKeyState(current => ({...current, [keyType]: state}));
      } catch (_) {
        return;
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener('keydown', updateKeyState(KeyState.pressed), false);
    document.addEventListener('keyup', updateKeyState(KeyState.notPressed), false);
  }, [updateKeyState]);

  useEffect(() => {
    const image1 = new Image();
    image1.src = '/vercel.svg';
    setImages(() => ({
      ['mainCharacter']: image1,
    }));
  }, []);

  // 一定間隔ごとに処理する
  useEffect(() => {
    if (!mainCharacter) {
      return;
    }
    if (latestIntervalTime <= latestCalcTime) {
      return;
    }
    const delta = latestIntervalTime - latestCalcTime;
    setLatestCalcTime(latestIntervalTime);

    // 物理世界の反映

    const diffX = (keyState: AllKeyState): number => {
      if (keyState.left === KeyState.pressed && keyState.right !== KeyState.pressed) {
        return -delta * 0.05;
      } else if (keyState.left !== KeyState.pressed && keyState.right === KeyState.pressed) {
        return delta * 0.05;
      } else {
        return 0;
      }
    };

    const diffY = (keyState: AllKeyState): number => {
      if (keyState.up === KeyState.pressed && keyState.down !== KeyState.pressed) {
        return -delta * 0.05;
      } else if (keyState.up !== KeyState.pressed && keyState.down === KeyState.pressed) {
        return delta * 0.05;
      } else {
        return 0;
      }
    };

    const nextPosition = {
      x: position.x + diffX(keyState),
      y: position.y + diffY(keyState),
    };

    setPosition({
      x: nextPosition.x,
      y: nextPosition.y,
    });
    setDrawableUnits([{x: nextPosition.x, y: nextPosition.y, h: 20, w: 30, imageKey: 'mainCharacter'}]);
  }, [latestIntervalTime, startTime, position, setLatestCalcTime, latestCalcTime, keyState, mainCharacter]);

  // 一定間隔ごとに描画する
  useEffect(() => {
    if (latestIntervalTime <= latestCalcTime) {
      return;
    }
    setLatestCalcTime(latestIntervalTime);
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
  }, [latestIntervalTime, startTime, position, setLatestCalcTime, latestCalcTime, images, keyState, drawableUnits]);

  return (
    <div>
      <canvas ref={canvasRef1} width={1200} height={900} hidden />
      <canvas ref={canvasRef2} width={1200} height={900} />
    </div>
  );
}
