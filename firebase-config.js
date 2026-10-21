// めいしばこ：Firebase の設定
//
// グループで名刺を共有する機能を使うときだけ必要です。
// Firebase コンソール →（歯車）プロジェクトの設定 →「マイアプリ」のウェブアプリ →「SDK の設定と構成」→「構成」に出てくる
// apiKey・authDomain・projectId・appId を、下の「例」の形で貼り付けてください。
//
// null のままだと、グループ機能は表示されず、今までどおり「この端末だけ」で動きます。
// ここに書く値は公開されても大丈夫なものです。データを守っているのは firestore.rules（アクセスルール）です。

export default null;

/* 例：
export default {
  apiKey: "AIza...",
  authDomain: "meishibako-xxxxx.firebaseapp.com",
  projectId: "meishibako-xxxxx",
  appId: "1:123456789012:web:abcdef1234567890"
};
*/
