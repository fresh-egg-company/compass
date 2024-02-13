import { useState, useCallback, useEffect } from 'react';
import './App.css';

function App() {
  const dialOuterSize = 260;                      // ダイヤルの外側の円の大きさ
  const dialSize = 180;                           // ダイヤルの内側の円の大きさ
  const dialDegreeSize = 210;                     // ダイヤルの度数の円の大きさ
  const arrowSize = 180;                          // 指針の大きさ
  const dialDirectionSize = dialOuterSize;        // 方位を表示する正方形の大きさ

  const [alpha, setAlpha] = useState(0.0);        // 取得する度数
  const [direction, setDirection] = useState(''); // 表示する方位

  // 表示する方位のセット
  const directionLetters = ['北', '北東', '東', '南東', '南', '南西', '西', '北西' ];

  // 現在の方位を表示
  useEffect(() => {
    if (alpha >= 360.0 - 22.5 || alpha < 22.5) {
      setDirection(directionLetters[0]);
    } else if (alpha >= 22.5 && alpha < 67.5) {
      setDirection(directionLetters[1]);
    } else if (alpha >= 67.5 && alpha < 112.5) {
      setDirection(directionLetters[2]);
    } else if (alpha >= 112.5 && alpha < 157.5) {
      setDirection(directionLetters[3]);
    } else if (alpha >= 157.5 && alpha < 202.5) {
      setDirection(directionLetters[4]);
    } else if (alpha >= 202.5 && alpha < 247.5) {
      setDirection(directionLetters[5]);
    } else if (alpha >= 247.5 && alpha < 292.5) {
      setDirection(directionLetters[6]);
    } else if (alpha >= 292.5 && alpha < 337.5) {
      setDirection(directionLetters[7]);
    }
  }, [alpha]);

  // 方位表示
  const renderDirectionLetters = () => {
    const rendered = [];
    let degree = 0;
    for(let each of directionLetters) {
      let sizeClass = '';
      if (each.length > 1) {
        sizeClass = ' small-letter';
      }
      rendered.push(<div key={degree} className={'dial-direction dial-direction-letter' + sizeClass}
                        style={{top: 0,
                                left: 0,
                                width: dialDirectionSize + 'px',
                                height: dialDirectionSize + 'px',
                                transform: `rotate(${degree}deg)`}}>
                      {each}
                    </div>);
      degree += 45;
    }
    return rendered;
  }

  // 度数表示
  const renderDegrees = () => {
    const rendered = [];
    for(let degree = 0; degree < 360; degree += 30) {
      rendered.push(<div key={degree} className='dial-direction degree-letter'
                        style={{top: ((dialOuterSize - dialDegreeSize) / 2) + 'px',
                              left: ((dialOuterSize - dialDegreeSize) / 2) + 'px',
                              width: dialDegreeSize + 'px',
                              height: dialDegreeSize + 'px',
                              transform: `rotate(${degree}deg)`}}>
                      {degree}
                    </div>);
    }
    return rendered;
  }

  // deviceorientationabsoluteのイベント処理
  const handleDeviceOrientationEvent = useCallback(event => {
    setAlpha(Math.round((360.0 - event.alpha) * 10) / 10);
  }, []);

  // 初期化処理
  useEffect(() => {
    window.addEventListener('deviceorientationabsolute', handleDeviceOrientationEvent);
  }, []);

  // 主処理
  return (
    <div className="App">
      <main className='dial-parent' style={{top: `calc((100dvh - ${dialOuterSize}px) / 2)`,
                                            left: `calc((100dvw - ${dialOuterSize}px) / 2)`,
                                            width: (dialOuterSize + 2) + 'px',
                                            height: (dialOuterSize + 2) + 'px',
                                            transform: `rotate(${360.0 - alpha}deg)`
                                            }}>
        <div className='dial dial-outer'
            style={{top: 0,
                    left: 0,
                    width: dialOuterSize + 'px',
                    height: dialOuterSize + 'px'}}>
        </div>
        <div className='dial dial-inner'
            style={{top: ((dialOuterSize - dialSize) / 2) + 'px',
                    left: ((dialOuterSize - dialSize) / 2) + 'px',
                    width: dialSize + 'px',
                    height: dialSize + 'px'}}>
        </div>
        <div className='arrow'
            style={{top: ((dialOuterSize - arrowSize) / 2) + 'px',
                    left: ((dialOuterSize - arrowSize) / 2) + 'px',
                    width: arrowSize + 'px',
                    height: arrowSize + 'px'}}>
        </div>
        <div className='line'
            style={{top: 0,
                    left: 0,
                    width: dialOuterSize + 'px',
                    height: dialOuterSize + 'px',
                    transform: `rotate(${alpha}deg)`}}>
        </div>
        {
          renderDirectionLetters()
        }
        {
          renderDegrees()
        }
      </main>
      <footer>
        <div className='display-value'>
          {alpha}°{direction}
        </div>
      </footer>
    </div>
  );
}

export default App;
