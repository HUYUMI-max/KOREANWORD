![build](https://github.com/<USER>/<REPO>/actions/workflows/ci.yml/badge.svg)

# 韓国語学習アプリ

韓国語の単語学習をサポートするWebアプリケーションです。

## 機能

- 韓国語と日本語の単語カード作成
- Microsoft Translator APIを使用した翻訳機能
- 単語リストの管理
- 学習進捗のトラッキング

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- Microsoft Translator API

## 環境変数の設定

以下の環境変数を設定する必要があります：

- `MICROSOFT_TRANSLATOR_KEY`: Microsoft Translator APIのキー
- `MICROSOFT_TRANSLATOR_LOCATION`: APIのリージョン（例：japaneast）

## 開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone [リポジトリURL]
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.local`ファイルを作成し、必要な環境変数を設定

4. 開発サーバーの起動
```bash
npm run dev
```

## デプロイ

このアプリケーションはVercelにデプロイされています。
環境変数はVercelのダッシュボードで設定する必要があります。

# TOPIK 単語帳 📚
[![CI](https://github.com/HUYUMI-max/KOREANWORD/actions/workflows/ci.yml/badge.svg)](https://github.com/HUYUMI-max/KOREANWORD/actions/workflows/ci.yml)
[![Deploy](https://vercel-badge.now.sh/HUYUMI-max/KOREANWORD)](https://koreanword.vercel.app)

> 韓国語単語をフォルダごとに管理し、フラッシュカード形式で復習できる Web アプリ

---

## 🚀 デモ  
https://koreanword.vercel.app

---

## 🛠 使用技術

| 分類 | スタック |
|------|----------|
| フロント | **Next.js (App Router) / TypeScript** |
| UI     | Tailwind CSS + shadcn/ui |
| 認証   | Clerk |
| データ | Firebase Auth / Firestore |
| CI / CD | GitHub Actions → Vercel |

---

## ⚡ クイックスタート

```bash
git clone https://github.com/HUYUMI-max/KOREANWORD.git
cd KOREANWORD
cp .env.local.example .env.local   # Firebase と Clerk のキーを記入
npm ci
npm run dev

## 🎯 主な機能

| UI | 機能概要 |
|----|----------|
| ➕ 右下の追加ボタン | 単語を **Firestore** に保存 |
| ⭐ お気に入り切り替え | 重要単語だけ抽出して学習 |
| 🔍 検索バー | フォルダ内をリアルタイム検索 |
| 🎲 シャッフルボタン | 出題順をランダム化 |

<!-- TODO: 実際のスクリーンショットに差し替える -->
<img src="docs/screenshot-desktop.png" width="700" alt="アプリ画面">

---

## 🔐 環境変数（.env.local）

| 変数名 | 用途 | 例 |
|--------|------|----|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | `AIz...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `myapp.firebaseapp.com` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 公開キー | `pk_...` |

> **注意:** サービスアカウントや秘密鍵は *絶対にコミットしない* でください。

---

## 🧪 CI / CD

| ツール | 内容 |
|--------|------|
| **GitHub Actions** (`.github/workflows/ci.yml`) | main ブランチ / PR で `npm ci` → `npm run build` を実行し、ビルド検証 |
| **Vercel** | CI が通過したコミットを自動デプロイ。URL はリポジトリ上部のバッジ先参照 |

---

## 🗺️ 今後のロードマップ <!-- TODO: 必要なら更新 -->

- 単語インポート（CSV / TSV）
- TOPIK 模擬テストモード
- モバイル UI の最適化

---

## 📄 ライセンス
MIT © 2025 HUYUMI-max

---

## ✔️ やることメモ

優先度：高
[ ] Microsoft Translator APIによる翻訳機能の実装・統合
[ ] お気に入り状態変更時のカード位置管理バグ修正
2番目以降の単語でお気に入りを押すと最初の単語に戻る
シャッフル状態が解除される
[ ] 状態管理の根本的な見直し（cards, index, shuffle, favoriteの同期・一元管理）
優先度：中
[ ] UI/UXのさらなる改善（特にモバイル体験の微調整）
[ ] パフォーマンス最適化（不要な再レンダリング抑制など）
[ ] エラーハンドリングの強化（API通信・翻訳失敗時のメッセージ表示）
[ ] テストの充実（ユニット・E2E）
優先度：低
[ ] ドキュメントの整備（README、API仕様、開発手順など）
[ ] コードのリファクタリング
[ ] デプロイメント設定の最終確認
技術的課題・注意点
[ ] APIキーやシークレットの.env管理とセキュリティ
[ ] 型安全性の向上（APIレスポンス型の厳密化）
[ ] サイドバーやカードUIのアクセシビリティ対応
[ ] 状態管理の複雑さ解消（楽観的UI更新と実データ同期）
今後の拡張案
[ ] 翻訳APIの切り替え（Google/DeepL等への対応）
[ ] 単語帳のインポート・エクスポート機能
[ ] ユーザーごとの学習進捗管理
[ ] アニメーションやガイドの追加
