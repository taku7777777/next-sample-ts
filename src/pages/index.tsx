import {Character} from '@/domain/model/character';
import {PhysicalObject} from '@/domain/model/physicalObject';
import {KeyState} from '@/shared/keyState';
import {KeyType} from '@/shared/keyType';
import {ObjectUtils} from '@/shared/objectUtils';
import {useEffect, useRef, useState} from 'react';

const DELTA_T = 25;

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
  const [latestDrawTime, setLatestDrawTime] = useState(startTime);

  // Image List(画像のインスタンスを事前に生成しておき使い回す)
  const [images, setImages] = useState<{[key: string]: CanvasImageSource | undefined}>({});

  // Key State
  const [keyState, setKeyState] = useState<AllKeyState>(
    ObjectUtils.fromEntries(KeyType.values().map(key => [key, KeyState.notPressed]))
  );

  // 物理世界の状態
  const [mainCharacter, setMainCharacter] = useState<Character | undefined>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatestIntervalTime(new Date().valueOf());
    }, DELTA_T);
    // setPosition((current) => ({ x: current.x + 1, y: current.y + 1 }));
    return () => clearInterval(interval);
  }, []);

  // initialize
  useEffect(() => {
    setMainCharacter({
      position: {x: 20, y: 20},
      velocity: {x: 0, y: 0},
      maxVelocity: {x: 5, y: 5},
      acceleration: {x: 0, y: 0},
      dimensions: {width: 35, height: 25},
      key: 'mainCharacter',
    });
  }, []);

  // initialize
  useEffect(() => {
    const updateKeyState = (state: KeyState) => (event: any) => {
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
    };
    document.addEventListener('keydown', updateKeyState(KeyState.pressed), false);
    document.addEventListener('keyup', updateKeyState(KeyState.notPressed), false);
  }, []);

  // initialize
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

    // Characterの状態を次の状態に移行します
    setMainCharacter(
      current =>
        current &&
        PhysicalObject.reflectVelocity(
          PhysicalObject.reflectAcceleration(
            PhysicalObject.addAcceleration(PhysicalObject.initializeAcceleration(current))(
              Character.covertUserInputToAcceleration(current)(keyState)
            )
          )(delta)
        )(delta)
    );
  }, [latestIntervalTime, startTime, setLatestCalcTime, latestCalcTime, keyState, mainCharacter]);

  // 一定間隔ごとに描画する
  useEffect(() => {
    if (latestCalcTime <= latestDrawTime) {
      return;
    }
    setLatestDrawTime(latestIntervalTime);

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

    console.log('mainCharacter', mainCharacter);

    const drawableUnits = [
      ...(mainCharacter
        ? [
            {
              x: mainCharacter.position.x,
              y: mainCharacter.position.y,
              w: mainCharacter.dimensions.width,
              h: mainCharacter.dimensions.height,
              imageKey: mainCharacter.key,
            },
          ]
        : []),
    ];

    ctx1.clearRect(0, 0, 1200, 900);
    drawableUnits.map(unit => {
      const image = images[unit.imageKey];
      if (!image) {
        console.warn('there is no error', unit.imageKey, images);
        return;
      }
      ctx1.drawImage(image, unit.x - unit.w / 2, unit.y - unit.h / 2, unit.w, unit.h);
    });
    const dat = ctx1.getImageData(0, 0, 1200, 900);
    ctx2.putImageData(dat, 0, 0);
  }, [
    latestIntervalTime,
    startTime,
    setLatestCalcTime,
    latestCalcTime,
    images,
    keyState,
    latestDrawTime,
    mainCharacter,
  ]);

  return (
    <div>
      <canvas ref={canvasRef1} width={1200} height={900} hidden />
      <canvas ref={canvasRef2} width={1200} height={900} />
    </div>
  );
}
