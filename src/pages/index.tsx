import {Character} from '@/domain/model/character';
import {PhysicalObject} from '@/domain/model/physicalObject';
import {KeyState} from '@/shared/keyState';
import {KeyType} from '@/shared/keyType';
import {ObjectUtils} from '@/shared/objectUtils';
import {useCallback, useEffect, useRef, useState} from 'react';

const DELTA_T = 25;

// 監視する必要のあるすべてのキーの状態
type AllKeyState = {
  [key in KeyType]: KeyState;
};

type AllState = {
  character: Character;
  blocks: PhysicalObject[];
};

export default function Home() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  // 状態の管理、初期値はわからないためundefinedも許容する
  const allState = useRef<AllState | undefined>(undefined);

  // Time Management
  const [startTime] = useState(new Date().valueOf());
  // 指定のインターバルで処理が発火された日時
  const [latestIntervalTime, setLatestIntervalTime] = useState(startTime);
  // 次の状態の算定が完了した最終日時
  const [latestCalcTime, setLatestCalcTime] = useState(startTime);
  // 画面描画が更新された最終日時
  const [latestDrawTime, setLatestDrawTime] = useState(startTime);

  // Image List(画像のインスタンスを事前に生成しておき使い回す)
  const images = useRef<{[key: string]: CanvasImageSource | undefined}>({});
  const pushImages = useCallback((key: string, image: CanvasImageSource) => {
    images.current = {...images.current, [key]: image};
  }, []);

  // Key State
  const initialKeyState = ObjectUtils.fromEntries(KeyType.values().map(keyType => [keyType, KeyState.notPressed]));
  const _keyState = useRef<AllKeyState>(initialKeyState);
  const updateKeyState = useCallback((keyType: KeyType, keyState: KeyState) => {
    _keyState.current = {..._keyState.current, [keyType]: keyState};
  }, []);

  // 物理世界の状態
  const [mainCharacter, setMainCharacter] = useState<Character | undefined>(undefined);
  const [blocks, setBlocks] = useState<PhysicalObject[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatestIntervalTime(new Date().valueOf());
    }, DELTA_T);
    return () => clearInterval(interval);
  }, []);

  // initialize
  useEffect(() => {
    allState.current = {
      character: {
        position: {x: 20, y: 120},
        velocity: {x: 0, y: 0},
        maxVelocity: {x: 5, y: 5},
        acceleration: {x: 0, y: 0},
        dimensions: {width: 80, height: 40},
        key: 'mainCharacter',
      },
      blocks: [
        {
          position: {x: 200, y: 50},
          velocity: {x: 0, y: 0},
          maxVelocity: {x: 0, y: 0},
          acceleration: {x: 0, y: 0},
          dimensions: {width: 300, height: 100},
        },
      ],
    };
  }, []);

  // initialize
  useEffect(() => {
    const _updateKeyState = (keyState: KeyState) => (event: any) => {
      try {
        const keyEventIndex = Number(event.keyCode);
        const keyType = KeyType.fromKeyEventIndex(keyEventIndex);
        if (!keyType) {
          return;
        }
        updateKeyState(keyType, keyState);
      } catch (_) {
        return;
      }
    };
    document.addEventListener('keydown', _updateKeyState(KeyState.pressed), false);
    document.addEventListener('keyup', _updateKeyState(KeyState.notPressed), false);
  }, [updateKeyState]);

  // initialize
  useEffect(() => {
    const image1 = new Image();
    image1.src = '/vercel.svg';
    const image2 = new Image();
    image2.src = '/block.png';
    pushImages('mainCharacter', image1);
    pushImages('block', image2);
  }, [pushImages]);

  // 一定間隔ごとに処理する
  useEffect(() => {
    if (latestIntervalTime <= latestCalcTime) {
      // すでに次の情報を算定済みのため処理不要
      return;
    }
    if (!allState.current) {
      // 初期化されていないため処理不要
      return;
    }

    setLatestCalcTime(latestIntervalTime);
    const delta = latestIntervalTime - latestCalcTime;
    const currentCharacter = allState.current.character;
    const currentBlocks = allState.current.blocks;

    const nextCharacter = currentBlocks.reduce<Character>(
      (cur, block) => PhysicalObject.isBlockedBy(currentCharacter)(cur)(block),
      PhysicalObject.reflectVelocity(
        PhysicalObject.reflectAcceleration(
          PhysicalObject.addAcceleration(PhysicalObject.initializeAcceleration(currentCharacter))(
            Character.covertUserInputToAcceleration(currentCharacter)(_keyState.current)
          )
        )(delta)
      )(delta)
    );
    allState.current = {
      ...allState.current,
      character: nextCharacter,
    };
  }, [latestIntervalTime, latestCalcTime]);

  // 一定間隔ごとに描画する
  useEffect(() => {
    if (latestCalcTime <= latestDrawTime) {
      return;
    }
    setLatestDrawTime(latestCalcTime);

    if (!canvasRef1.current || !canvasRef2.current || !allState.current) {
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

    const character = allState.current.character;
    const blocks = allState.current.blocks;

    const drawableUnits = [
      ...(character
        ? [
            {
              y: character.position.y,
              x: character.position.x,
              w: character.dimensions.width,
              h: character.dimensions.height,
              imageKey: character.key,
            },
          ]
        : []),
      ...blocks.map(block => ({
        x: block.position.x,
        y: block.position.y,
        w: block.dimensions.width,
        h: block.dimensions.height,
        imageKey: 'block',
      })),
    ];

    ctx1.clearRect(0, 0, 1200, 900);
    drawableUnits.map(unit => {
      const image = images.current[unit.imageKey];
      if (!image) {
        console.warn('there is no error', unit.imageKey, images);
        return;
      }
      ctx1.drawImage(image, unit.x - unit.w / 2, unit.y - unit.h / 2, unit.w, unit.h);
    });
    const dat = ctx1.getImageData(0, 0, 1200, 900);
    ctx2.putImageData(dat, 0, 0);
  }, [latestCalcTime, latestDrawTime]);

  return (
    <div>
      <canvas ref={canvasRef1} width={1200} height={900} hidden />
      <canvas ref={canvasRef2} width={1200} height={900} />
    </div>
  );
}
