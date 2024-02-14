[目次へ](https://github.com/fresh-egg-company/compass/blob/main/README.md)

## 1.方位を数値で表示

まず、現在スマホが向いている方位をWebブラウザで取得できないと、このアプリは完成しない。方位を取得できるかどうか、そして、どのように取得するか確認する。

### 1-1.基盤作成

まず、アプリの開発の基盤を作る。アプリ名はcompass、create-react-appで作成する。

```console
fecMBA:dev fec$ npx create-react-app compass

Creating a new React app in /Users/fec/dev/compass.

Installing packages. This might take a couple of minutes.
Installing react, react-dom, and react-scripts with cra-template...

...中略...

Success! Created compass at /Users/fec/dev/compass
Inside that directory, you can run several commands:

  npm start
    Starts the development server.

  npm run build
    Bundles the app into static files for production.

  npm test
    Starts the test runner.

  npm run eject
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

  cd compass
  npm start

Happy hacking!
fecMBA:dev fec$ 

```
この後、プロジェクトが正しく作られていることを確認する。

```console
fecMBA:dev fec$ cd compass
fecMBA:compass fec$ npm start

> compass@0.1.0 start
> react-scripts start

...中略...

Compiled successfully!

You can now view compass in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.128.129:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```
開発PCのブラウザで以下のように表示される。

<img src="https://github.com/fresh-egg-company/compass/blob/main/doc/images/compass_0_screen.jpg" width="50%" alt="compass_0_screen" >

無事アプリとして起動し、基盤が整ったことを確認した。
この時点のプロジェクトファイルを[ここ](https://github.com/fresh-egg-company/compass/tree/main/compass.0)に置いておく。

プロジェクトファイルには`node_modules`は入れていないので、cloneして動かす際は、`npm i`で必要なモジュールをダウンロードすること。

### 1-2.方位の取得と表示

この後、'Edit src/App.js and save to reload.'の部分を、'0.00°北'というように、スマホが現在向いている方位を表示するよう処理を書き換える。

Webアプリにおいて、方位を取得するには、deviceorientationabsoluteイベントのイベントハンドラーで処理を行う。

https://developer.mozilla.org/ja/docs/Web/API/Window/deviceorientationabsolute_event

類似したイベントにdeviceorientationイベントがあるが、これは、アプリ起動時のスマホの方位を0とした相対的な方位であり、コンパスを実装するには使えない。

このイベントには色々なプロパティがあるが、方位の取得はalphaプロパティを参照する。alphaプロパティには、方位が0.0から360.0の浮動小数点で入る。

方位の表記は、以下のルールで表示することとする。

|alphaプロパティ値|表記方位|
|-|-|
|337.5以上または22.5未満|北|
|22.5以上67.5未満      |北東|
|67.5以上112.5未満     |東|
|112.5以上157.5未満    |南東|
|157.5以上202.5未満    |南|
|202.5以上247.5未満    |南西|
|247.5以上292.5未満    |西|
|292.5以上337.5未満    |北西|

上記に基づき、App.jsを以下のように書き換える。

src/App.js
```javascript
import { useState, useCallback, useEffect } from 'react';
import logo from './logo.svg';
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
      setAlpha(event.alpha);
  }, []);

  useEffect(() => {
    window.addEventListener('deviceorientationabsolute', handleDeviceOrientationEvent);
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {alpha}°{direction}
        </p>
      </header>
    </div>
  );
}

export default App;

```

ブラウザの設定によっては、ブラウザが自発的にページの翻訳を試みたりするが、このコンパスアプリでは、それは有害な結果をもたらす。私の環境で発生した問題は、
1. 方位、度数の表示がスマホの向きに関わらす固定されてしまう
2. ページのタイトルが「反応アプリ」という名前に翻訳されてしまう

というものだった。
特に最初の問題は致命的なため、public/index.htmlの2行目を、以下のように書き換えることで対応する。

public/index.html
```htm
<html lang="ja">
```

### 1-3.実行環境

実行環境の要件は以下の通り。

1. テスト用スマホがテスト用実行環境にで接続すること
2. テスト用実行環境をホストするPCとテスト用スマホが同一ネットワークにあること。

1の要件の理由は、

https://developer.mozilla.org/ja/docs/Web/API/Window/deviceorientationabsolute_event

ここに書かれている通り、deviceorientationabsoluteイベントは、https接続されたWebページでないと機能しないためである。

正しくは、テスト用実行環境にサーバー証明書を使用することになるが、ここでは、サーバー証明書抜きで用実行環境をホストすることとする。

その手順は以下の通り。

1. プロジェクトのディレクトリに、以下の内容のファイルを.env.localという名前で作る。

.env.local
```console
HTTPS=true
```

2. その後、npm startで起動する。

3. 起動時に表示されるURLのうち、’On Your Network:’で表示されるURLをスマホのWebブラウザに入力する。

4. スマホの画面に、’この接続ではプライバシーが保護されません’と表示された警告画面が表示される。そのページ下部にある'詳細設定’をタップする。

<img src="https://github.com/fresh-egg-company/compass/blob/main/doc/images/warning_1_screen.jpg" width="50%" alt="warning_1_screen" >

5. スマホの画面が切り替わり、’このサーバーがXXX.XXX.XXX.XXXであることを確認できませんでした。'と警告が表示される。そのページの中ほどにある、’XXX.XXX.XXX.XXX’にアクセスする（安全ではありません）’をクリックする。

<img src="https://github.com/fresh-egg-company/compass/blob/main/doc/images/warning_2_screen.jpg" width="50%" alt="warning_2_screen" >

6. スマホの画面にアプリが表示され、頻繁に方位が書き変わるのが確認できる。

アプリをテストするたびに毎回この操作をしなくてはならないかと思うとゾッとするが、幸いにも、一度この手順を踏んでしまえば、暫くは警告画面は出てこなくなる。

### 1-4.テストとデバッグ

アプリの画面を色々な方向に振り回すと、方位の数字と文字が頻繁に変わっていくことがわかる。その動きを観察し、不具合を洗い出す。
見つかった不具合は以下の3つ。

1. スマホを西に向けると'東'と表示され、スマホを東に向けると'西'と表示される。これは明白な不具合である。これを不具合#1とする。
2. 方位の度数があまりに頻繁に更新され、桁数もまちまちに表示されるので、数字が読み取れない。これを不具合#2とする。
3. reactの回転する原子の図は意味をなさないため不要。これを不具合#3とする。

それぞれの原因を調べ、修正を行う。

1. deviceorientationabsoluteイベントのalphaプロパティの値を確認してみると、スマホを西に向けた時、90近辺の値を、スマホを東に向けた時、270近辺の値となる。これは明らかに一般的な方位の度数とは異なる。

参考：航海の基礎 http://support.fujita-kaijidairisi.com/index.php?航海の基礎

そのため、deviceorientationabsoluteイベントのイベントハンドラーで、方位の補正を行う。

src/App.jsの一部
```javascript
  // deviceorientationabsoluteのイベント処理
  const handleDeviceOrientationEvent = useCallback(event => {
    setAlpha(360.0 - event.alpha);
  }, []);
```

2. 数字が読み取れない一番の原因は、表示される桁数がまちまちのため、数字の位置が定まらないことにある。次に、ごくわずかな度数の変化にも敏感に反応して表示更新を行うため、表示更新が頻繁すぎる。そのため、度数は小数点以下第1位程度までとして表示位置を固定し、かつ度数の変化に必要以上に敏感にならないようにする。

src/App.jsの一部
```javascript
  // deviceorientationabsoluteのイベント処理
  const handleDeviceOrientationEvent = useCallback(event => {
    setAlpha(Math.round((360.0 - event.alpha) * 10) / 10);
  }, []);
```

3. は、不要な要素を削除することで解決する。App.jsとApp.cssから以下の行を削除することで解決する。

src/App.jsの一部
```javascript
import logo from './logo.svg';

        <img src={logo} className="App-logo" alt="logo" />
```

src/App.cssの一部
```css
.App-logo {
  height: 40vmin;
  pointer-events: none;
}

.App-link {
  color: #61dafb;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

これらの不具合を修正した後のアプリの画面は以下の通りとなる。

<img src="https://github.com/fresh-egg-company/compass/blob/main/doc/images/compass_1_screen.jpg" width="50%" alt="compass_1_screen" >

この時点のプロジェクトファイルを[ここ](https://github.com/fresh-egg-company/compass/tree/main/compass.1)に置いておく。

プロジェクトファイルには`node_modules`は入れていないので、cloneして動かす際は、`npm i`で必要なモジュールをダウンロードすること。
