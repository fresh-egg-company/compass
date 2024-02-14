[目次へ](https://github.com/fresh-egg-company/compass/blob/main/README.md)

# 3.スマホの回転に対応

コンパスアプリとしての機能は全て実装されたが、スマホの設定で画面が自動回転になっていると、少々不都合が発生する。
スマホを横方向に向けると、画面が再描画される。そのため、回転のモーションが入ることもあり、画面が読みづらいものになってしまうのだ。
これを避けるため、スマホの縦横に関わらず、常に画面を縦方向に固定することとする。

## 3-1.画面の固定用API

画面の向きを縦方法に固定するには、screen.orientation.lockメソッドを使用する。

https://developer.mozilla.org/ja/docs/Web/API/CSS_Object_Model/Managing_screen_orientation

このメソッドに引数"portrait-primary"を渡せば、画面の向きが縦方向に固定されるが、このAPIには制限がある。
上記のドキュメントに書かれている通り、ブラウザーがトップレベルのブラウジングコンテキストの Document がフルスクリーンになっていることを要求する。そして、フルスクリーン表示にするには、下のドキュメントに書かれている通り、ユーザーの操作、例えばボタンのクリックなどをきっかけに、処理が実行される必要がある。

https://developer.mozilla.org/ja/docs/Web/API/Element/requestFullscreen

## 3-2.画面固定ボタンの追加

ユーザーの操作をきっかけに処理を行わないと、画面の向きを固定できないことがわかったので、画面固定用チェックボックスを追加することにする。場所は、方位、度数を表示している箇所の下とする。

src/App.js

```htm
        <div className='operation-frame'>
          <input type='checkbox' id='lockOrientation' />
          <label htmlFor='lockOrientation' className='lock-orientation-label' onClick={onClick}>画面固定</label>
        </div>
```

※onClickイベントのイベントハンドラーは、のちに実装する。

src/App.css

```css
.operation-frame {
  text-align: center;
  height: 48px;
}

.lock-orientation-label {
  font-size: 18px;
  color: white;
}
```

## 3-3.画面固定の処理

次に、画面固定チェックボックスがチェックされた時に画面を縦方向に固定する処理、そして、画面固定チェックボックスのチェックが外れた時の画面の固定を解除する処理を追加する。

画面を縦方向に固定する処理は、
1. 画面をフルスクリーンモードにする
2. 画面の方向を固定する
という順で処理を行う。

画面の固定を解除する処理は、
1. 画面の方向の固定を解除する
2. 画面のフルスクリーンを解除する
という順で処理を行う。

開発用PCなど、回転に対応していないデバイスで、スマホでは起こらないであろう例外も発生したため、それらの例外も地道に拾っておく。
また、フルスクリーンになった時、アプリの閉じ方などに困らないよう、ナビゲーション UIは常に表示させるようにしておく。

これらの処理を以下のように追加した。

src/App.js
```javascript

  const onClick = event => {
    if (event.target.checked) {
      document.documentElement.requestFullscreen({ navigationUI : 'show'})
      .then(() => {
        window.screen.orientation.lock("portrait-primary")
        .catch(err => {
          event.target.checked = false;
          alert(`画面が固定できませんでした。${err.message}`);
        })
      })
      .catch(err => {
        event.target.checked = false;
        alert(`画面が固定できませんでした。${err.message}`);
      });
    } else {
      if (window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
        if (document.fullscreenElement) {
          document.exitFullscreen()
          .catch(err => {
            alert(`画面固定を解除できませんでした。${err.message}`);
          });
        }
      }
    }
  }
```

その結果、画面固定チェックボックスをONにすると、以下のように表示されるようになった。

<img src="https://github.com/fresh-egg-company/compass/blob/main/doc/images/compass_3_screen.jpg" width="50%" alt="compass_3_screen">


# 4.仕上げ

スマホ用コンパスアプリの仕上げを行う。

## 4-1.ホーム画面のアイコン

このコンパスアプリをホーム画面に追加する際のアイコンを設定する。アイコンは、以下のサイトの物を使わせていただいた。

方位磁針のアイコン素材2 | アイコン素材ダウンロードサイト「icooon-mono」 
https://icooon-mono.com/10980-方位磁針のアイコン素材2/

public/favicon.ico、public/logo512.pngのファイルを置き換えるため、このサイトから、64px、512pxのサイズの素材をダウンロードさせていただく。
その後、public/logo192.pngの画像を、512pxの素材をダウンスケールすることで作成する。

## 4-2.アプリの名前

この名前を「コンパスアプリ」と命名する。
命名した名前を、public/index.htmlに設定する。

public/index.html
```htm
    <title>コンパスアプリ</title>
```

次に、public/manifest.jsonに設定する。

public/manifest.json
```json
  "short_name": "コンパスアプリ",
  "name": "コンパスアプリ",
```

## 4-3.本番配布パスを決定する。

このアプリを本番サーバーに投入する時、どのようなURLでアクセスしてもらうかを決める。このコンパスアプリは、このアプリのためだけのドメイン名は作らず、既存のホストにディレクトリパス名を追加した形とする。

https://fec.mydns.jp/cmp

この形で本番に配布するため、cross-envというツールを使う。

cross-envのインストール
```console
fecMBA:compass fec$ npm i cross-env

added 1 package, and audited 1557 packages in 11s

254 packages are looking for funding
  run `npm fund` for details

8 vulnerabilities (2 moderate, 6 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
fecMBA:compass fec$ 
```

そして、package.jsonのbuildの箇所を書き換える。
package.json
```json
    "build": "cross-env PUBLIC_URL=/cmp react-scripts build",
```

## 4-4.アプリのビルドと本番環境への反映

以上で設定は完了した。残るは、本番用ビルドと本番への反映である。

本番用ビルドは、npm run buildで行う。

```console
fecMBA:compass fec$ npm run build

> compass@0.1.0 build
> cross-env PUBLIC_URL=/cmp react-scripts build

Creating an optimized production build...
One of your dependencies, babel-preset-react-app, is importing the
"@babel/plugin-proposal-private-property-in-object" package without
declaring it in its dependencies. This is currently working because
"@babel/plugin-proposal-private-property-in-object" is already in your
node_modules folder for unrelated reasons, but it may break at any time.

babel-preset-react-app is part of the create-react-app project, which
is not maintianed anymore. It is thus unlikely that this bug will
ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
your devDependencies to work around this error. This will make this message
go away.
  
Compiled with warnings.

[eslint] 
src/App.js
  Line 36:6:  React Hook useEffect has a missing dependency: 'directionLetters'. Either include it or remove the dependency array              react-hooks/exhaustive-deps
  Line 84:6:  React Hook useEffect has a missing dependency: 'handleDeviceOrientationEvent'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

Search for the keywords to learn more about each warning.
To ignore, add // eslint-disable-next-line to the line before.

File sizes after gzip:

  47.33 kB (+462 B)  build/static/js/main.80ea9eec.js
  1.78 kB            build/static/js/787.b250c404.chunk.js
  689 B (-17 B)      build/static/css/main.1cf20056.css

The project was built assuming it is hosted at /cmp/.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.

Find out more about deployment here:

  https://cra.link/deployment

fecMBA:compass fec$ 
```

これで、buildフォルダに、本番へ配布する全てが作成される。これを本番サーバーの/cmpに該当する箇所にコピーする。通常はscpを使ってコピーするだろうが、方法はなんでも良い。ただし、staticサブフォルダも含めてコピーすること。

```console
fecMBA:compass fec$ cd build
fecMBA:build fec$ scp -r * XXXX@XXXXXXXXXX:/XXXXXXX/cmp
asset-manifest.json                                                                                                  100%  545     1.3KB/s   00:00    
favicon.ico                                                                                                          100% 1576     5.0KB/s   00:00    
index.html                                                                                                           100%  676     1.9KB/s   00:00    
logo192.png                                                                                                          100%   21KB  34.0KB/s   00:00    
logo512.png                                                                                                          100%   15KB  56.5KB/s   00:00    
manifest.json                                                                                                        100%  502     1.6KB/s   00:00    
robots.txt                                                                                                           100%   67     0.2KB/s   00:00    
main.1cf20056.css.map                                                                                                100% 2680     8.5KB/s   00:00    
main.1cf20056.css                                                                                                    100% 1546     4.5KB/s   00:00    
main.80ea9eec.js                                                                                                     100%  143KB 143.8KB/s   00:00    
787.b250c404.chunk.js.map                                                                                            100%   10KB  33.7KB/s   00:00    
main.80ea9eec.js.LICENSE.txt                                                                                         100%  971     3.1KB/s   00:00    
787.b250c404.chunk.js                                                                                                100% 4514    11.4KB/s   00:00    
main.80ea9eec.js.map                                                                                                 100%  368KB 379.6KB/s   00:00    
fecMBA:build fec$ 
```

これで、ビルドと本番への配布は完了した。配布先URLにスマホからアクセスし、アプリが正しく動作すること、そして、ホーム画面に追加して、設定したアプリ名とアイコン画像でアプリがホーム画面に追加されたことを確認する。

<img src="https://github.com/fresh-egg-company/compass/blob/main/doc/images/icon_on_home.jpg" width="50%" alt="icon_on_home">


完成形のプロジェクトファイルを[ここ](https://https://github.com/fresh-egg-company/compass/edit/main/compass.3)に置いておく。

プロジェクトファイルには`node_modules`は入れていないので、cloneして動かす際は、`npm i`で必要なモジュールをダウンロードすること。

