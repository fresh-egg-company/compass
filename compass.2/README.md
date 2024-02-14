[目次へ](https://github.com/fresh-egg-company/compass/blob/main/README.md)

## 2.指針と方位ダイヤルを表示

方位と度数は表示されるようになったが、コンパスと呼ぶには程遠い画面であるので、コンパスアプリとして必要な表示を行うようにする。

では、どのような表示をすればコンパスらしいか？iPhoneのコンパスを見てみよう。

iPhoneのコンパスの画面には、
- 指針
- 方位と度数を表すダイヤル

があることがわかる。

iPhoneのコンパスと本物のコンパスとの違いは、

1. 本物は、方位と度数を表すダイヤルは回転せず、指針だけが常に北を向いている
2. iPhoneのコンパスは方位と度数を表すダイヤルが、常に北を向くよう回転する

という違いがある。スマホ用アプリとしては、2の方が自然に見えるため、2の方法を採用することとする。

### 2-1. 指針
指針は、習慣的に北を指す方を赤、南を指す方を黒や白とするようである。また、針であるので、先が尖っていた方が、それっぽい。
図を書く方法としてはsvgを利用するのが一般的であるが、描きたいのは単純な図形であるため、正方形をclip-pathでクリッピングする方法をとる。

https://developer.mozilla.org/ja/docs/Web/CSS/clip-path

### 2-2. 方位と度数を表すダイヤル
このパネルには、北、北東、東、南東、南、南西、西、北西の8つの方位を表示することとする。スマホの向く方位によって回転させるため、正方形の端に方位を表示させる方法をとる。
1. まず北を表示する。
2. 次に、同じ位置で、45度回転させて北東を表示する。
3. さらに、同じ位置で、90度回転させて東を表示する。
4. さらに、同じ位置で、135度回転させて南東を表示する。
   ...

この要領で、北西まで繰り返す。
度数についても、方位と同じ手法で、30度単位で度数を表示させる。

方位の変化を検出した時、方位と度数を表すダイヤルごと回転させることで、コンパスとして機能させる。そのため、htmlのセクション分けを修正する。

今まで、\<header\>セクションで表示していた方位、度数は、レイアウトとしてはフッターになるため、\<footer\>セクションに、そして、これから表示する指針やダイヤルは\<main\>セクションに置くこととする。

### 2-3. その他
その他、コンパスアプリとして使い勝手を上げるために、いくつか配慮すべき点がある。
- 画面をピンチ操作で拡大や縮小させると、コンパスが見えなくなる。

  これを避けるために、cssでtouch-actionを指定する。
```css
  touch-action: none;
```

- 画面で文字の部分をタップすると、文字が選択状態になってしまい、見づらくなる。

  これを避けるために、cssでuser-selectを指定する。
```css
  user-select: none;
```

これらを反映したApp.js、App.cssは以下の通りとなる。

src/App.js
```javascript
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
```

src/App.css
```css
body {
  background-color: #222;
  margin: 0;
  width: 100dvw;
  height: 100dvh;
  user-select: none;
  touch-action: none;
  text-align: center;
}

main {
  overflow: hidden;
  width: 100dvw;
  height: calc(100dvh - 120px);
  top: 0;
}

.dial-parent {
  position: absolute;
}

.dial {
  position: absolute;
  border-style: solid;
  border-radius: 50%;
  border-color: #444;
  border-width: 1px;
}

.arrow {
  position: absolute;
  background: linear-gradient(#F00, #FFF);
  clip-path: polygon(50% 0, 70% 50%, 50% 100%, 30% 50%);
}

.line {
  position: absolute;
  background: lightgray;
  clip-path: polygon(calc(50% - 1px) 0, calc(50% - 1px) 30%, calc(50% + 1px) 30%, calc(50% + 1px) 0);
}

.dial-direction {
  position: absolute;
  top: 0;
  width: 100%;
}

.dial-direction-letter {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: white;
  background-color: transparent;
}

.small-letter {
  font-size: 18px;
  font-weight: normal;
}

.degree-letter {
  position: absolute;
  font-size: 12px;
  font-weight: normal;
  color: white;
  background-color: transparent;
}

footer {
  position: absolute;
  bottom: 0;
  height: 120px;
  width: 100%;
}

.display-value {
  font-size: 32px;
  width: 100%;
  color: white;
}
```

これを実行すると、以下のように表示される。

<img src="https://github.com/fresh-egg-company/compass/blob/main/doc/images/compass_2_screen.jpg" width="50%" alt="compass_2_screen" >

最初のうちは、表示される方位が狂っているように見えるが、以下の動画に従って補正を行なっていくと、だんだん正しい方位を表すようになる。

https://youtu.be/J_cZnPcW-Yw?feature=shared

この時点のプロジェクトファイルを[ここ](https://github.com/fresh-egg-company/compass/tree/main/compass.2)に置いておく。

プロジェクトファイルには`node_modules`は入れていないので、cloneして動かす際は、`npm i`で必要なモジュールをダウンロードすること。

[次へ](https://github.com/fresh-egg-company/compass/tree/main/compass.3/README.md)
