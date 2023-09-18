import {useEffect, useRef, useState} from 'react';

const DELTA_T = 25;

export const useTimeManager = () => {
  // Time Management
  const basisTimeRef = useRef(new Date().valueOf());
  // 指定のインターバルで処理が発火された日時
  const [triggeredLatest, setTriggeredLatest] = useState(basisTimeRef.current);
  // 次の状態の算定が完了した最終日時
  const [calculatedLatest, setCalculatedLatest] = useState(basisTimeRef.current);
  // 画面描画が更新された最終日時
  const [drawnLatest, setDrawnLatest] = useState(basisTimeRef.current);

  useEffect(() => {
    const interval = setInterval(() => {
      setTriggeredLatest(new Date().valueOf());
    }, DELTA_T);
    return () => clearInterval(interval);
  }, []);

  return {
    triggeredLatest,
    calculatedLatest,
    setCalculatedLatest,
    drawnLatest,
    setDrawnLatest,
  };
};
