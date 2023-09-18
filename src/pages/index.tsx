import {Character} from '@/domain/model/character';
import {PhysicalObject} from '@/domain/model/physicalObject';
import {KeyState} from '@/shared/keyState';
import {KeyType} from '@/shared/keyType';
import {ObjectUtils} from '@/shared/objectUtils';
import {useEffect, useRef} from 'react';
import {useTimeManager} from './useTimeManager';
import {useKeyManager} from './useKeyManager';
import {useImageManager} from './useImageManager';
import {GravityAffectedObject} from '@/domain/model/gravityAffectedObject';

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
  const physicalState = useRef<AllState | undefined>(undefined);

  // レンダリングや処理の再実行をコントロールするためのhooks
  const {triggeredLatest, calculatedLatest, setCalculatedLatest, drawnLatest, setDrawnLatest} = useTimeManager();

  // Key State
  const initialKeyState = ObjectUtils.fromEntries(KeyType.values().map(keyType => [keyType, KeyState.notPressed]));
  const keyState = useRef<AllKeyState>(initialKeyState);
  useKeyManager(keyState);

  // Image List(画像のインスタンスを事前に生成しておき使い回す)
  const images = useRef<{[key: string]: CanvasImageSource | undefined}>({});
  useImageManager(images);

  // initialize
  useEffect(() => {
    physicalState.current = {
      character: {
        position: {x: 20, y: 120},
        velocity: {x: 0, y: 0},
        maxVelocity: {x: 0.25, y: 0.5},
        acceleration: {x: 0, y: 0},
        dimensions: {width: 80, height: 40},
        key: 'mainCharacter',
        isLanding: false,
      },
      blocks: [
        {
          position: {x: 200, y: 50},
          velocity: {x: 0, y: 0},
          maxVelocity: {x: 0, y: 0},
          acceleration: {x: 0, y: 0},
          dimensions: {width: 3000, height: 100},
        },
      ],
    };
  }, []);

  // 一定間隔ごとに処理する
  useEffect(() => {
    if (triggeredLatest <= calculatedLatest) {
      // すでに次の情報を算定済みのため処理不要
      return;
    }
    if (!physicalState.current) {
      // 初期化されていないため処理不要
      return;
    }

    setCalculatedLatest(triggeredLatest);

    const delta = triggeredLatest - calculatedLatest;
    const currentCharacter = physicalState.current.character;
    const currentBlocks = physicalState.current.blocks;

    const nextCharacter = GravityAffectedObject.reflectIsLanding(
      currentBlocks.reduce<Character>(
        (cur, block) => PhysicalObject.isBlockedBy(currentCharacter)(cur)(block),
        PhysicalObject.reflectVelocity(
          PhysicalObject.reflectAcceleration(
            // ユーザーの入力に応じて加速度を追加
            GravityAffectedObject.addGravityIfNotLanding(
              PhysicalObject.addAcceleration(PhysicalObject.initializeAcceleration(currentCharacter))(
                Character.covertUserInputToAcceleration(currentCharacter)(keyState.current)
              )
            )
          )(delta)
        )(delta)
      )
    )(currentBlocks);
    physicalState.current = {
      ...physicalState.current,
      character: nextCharacter,
    };

    if (nextCharacter.velocity.x > 0.25) {
      console.log('is over velocity x', nextCharacter.velocity.x);
    }
  }, [triggeredLatest, calculatedLatest, setCalculatedLatest]);

  // 一定間隔ごとに描画する
  useEffect(() => {
    if (calculatedLatest <= drawnLatest) {
      return;
    }
    setDrawnLatest(calculatedLatest);

    if (!canvasRef1.current || !canvasRef2.current || !physicalState.current) {
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

    const character = physicalState.current.character;
    const blocks = physicalState.current.blocks;

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
      ctx1.drawImage(image, unit.x - unit.w / 2 + 100, 800 - (unit.y + unit.h / 2), unit.w, unit.h);
    });
    const dat = ctx1.getImageData(0, 0, 1200, 900);
    ctx2.putImageData(dat, 0, 0);
  }, [calculatedLatest, drawnLatest, setDrawnLatest]);

  return (
    <div>
      <canvas ref={canvasRef1} width={1200} height={900} hidden />
      <canvas ref={canvasRef2} width={1200} height={900} />
    </div>
  );
}
