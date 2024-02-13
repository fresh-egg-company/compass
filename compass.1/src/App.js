import { useState, useCallback, useEffect } from 'react';
import './App.css';

function App() {
  const [alpha, setAlpha] = useState(0.0);        // 取得する方位
  const [direction, setDirection] = useState(''); // 表示する方位

  // 表示する方位のセット
  useEffect(() => {
    if (alpha >= 360.0 - 22.5 || alpha < 22.5) {
      setDirection('北');
    } else if (alpha >= 22.5 && alpha < 67.5) {
      setDirection('北東');
    } else if (alpha >= 67.5 && alpha < 112.5) {
      setDirection('東');
    } else if (alpha >= 112.5 && alpha < 157.5) {
      setDirection('南東');
    } else if (alpha >= 157.5 && alpha < 202.5) {
      setDirection('南');
    } else if (alpha >= 202.5 && alpha < 247.5) {
      setDirection('南西');
    } else if (alpha >= 247.5 && alpha < 292.5) {
      setDirection('西');
    } else if (alpha >= 292.5 && alpha < 337.5) {
      setDirection('北西');
    }
  }, [alpha]);

  // deviceorientationabsoluteのイベント処理
  const handleDeviceOrientationEvent = useCallback(event => {
    setAlpha(Math.round((360.0 - event.alpha) * 10) / 10);
  }, []);

  useEffect(() => {
    window.addEventListener('deviceorientationabsolute', handleDeviceOrientationEvent);
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <p>
          {alpha}°{direction}
        </p>
      </header>
    </div>
  );
}

export default App;
