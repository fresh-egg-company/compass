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
