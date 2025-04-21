# 🔗 Link Checker (Tauri + SvelteKit)

Tauri × SvelteKit によって構築された、**ローカルJSONファイル内の論文URLを一括チェック**する軽量デスクトップアプリです。
卒業研究の参考文献集が膨大になってきて、URLの生存確認作業が手動だと手に負えなくなってきたので自動化しました。

![CI Status](https://github.com/your-username/link-checker/actions/workflows/ci.yml/badge.svg)

---

## 📦 特徴

- ✅ **ファイル選択ダイアログ**から `urls.json` を読み込み
- 🚦 各リンクに対して **HTTPステータス**と **RTTは応答時間** を表示
- 🔁 **403 応答に自動リトライ（指数バックオフ）**
- ⏱ **遅延時間をURLとRTTに基づいて動的に計算**
- 🧪 `Vitest + vitest-fetch-mock`によるユニットテスト
- ⚡ **CORSを回避**するため Tauri plugin + ネイティブ fetch を使用

---

## 🚀 使用方法

### 1. 開発環境構築

```bash
git clone https://github.com/your-username/link-checker.git
cd link-checker
npm install
```

### 2. 開発モードで起動

```bash
npm run tauri dev
```

### 3. 本番ビルド

```bash
npm run tauri build
```

---

## 🧪 テスト実行

```bash
npx vitest run
```

テストケースは基本的な非同期挙動と403リトライをカバーしており、mockとタイマー制御によって即時完了します。

---

## 📂 `urls.json` の形式

```json
[
  "https://example.com/paper1.pdf",
  "https://researchgate.net/publication/xxxxx",
  "https://arxiv.org/pdf/1234.5678.pdf"
]
```

`urls.json`をアプリに読み込せると、自動でステータスチェックが始まります。

---

## 🛠 技術スタック

| 種類        | 技術                       |
|-------------|----------------------------|
| フレームワーク | SvelteKit + Vite             |
| デスクトップ  | Tauri v2 + Rust              |
| UI           | Bulma CSS                   |
| テスト       | Vitest + vitest-fetch-mock  |
| CORS回避     | `tauri-plugin-cors-fetch`   |

---

## ✅ GitHub Actions CI

- `push`時に自動テストが実行されます

---

## 🧐 応用例・今後の展開

- 📄 PDFのオフライン保存チェック
- 📟 CSVエクスポート対応
- 🔐 Electronバージョンとの比較研究
- 🧑‍💼 **学術研究の提出物チェック**用途として活用実績あり

---

## 📜 ライセンス

MIT License

---
