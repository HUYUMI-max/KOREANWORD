# 韓国語学習アプリ

[![CI](https://github.com/HUYUMI-max/KOREANWORD/actions/workflows/ci.yml/badge.svg)](https://github.com/HUYUMI-max/KOREANWORD/actions/workflows/ci.yml)
[![Deploy](https://vercel-badge.now.sh/HUYUMI-max/KOREANWORD)](https://koreanword.vercel.app)

韓国語の単語学習をサポートするWebアプリケーションです。フォルダごとに単語を管理し、単語カード形式で効率的に学習できます。

## 主な機能

- 韓国語と日本語の単語カード作成
- Microsoft Translator APIを使用した翻訳機能
- 単語リストの管理（フォルダ別）
- お気に入り機能
- リアルタイム検索
- シャッフル機能

## 技術スタック

| 分類 | 使用技術 |
|------|----------|
| フロントエンド | Next.js (App Router) / TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| 認証 | Clerk |
| データベース | Firebase Auth / Firestore |
| 翻訳 | Microsoft Translator API |
| CI/CD | GitHub Actions → Vercel |

## クイックスタート

1. リポジトリのクローン
```bash
git clone https://github.com/HUYUMI-max/KOREANWORD.git
cd KOREANWORD
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

## 環境変数の設定

| 変数名 | 用途 | 例 |
|--------|------|----|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | `AIz...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `myapp.firebaseapp.com` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 公開キー | `pk_...` |
| `MICROSOFT_TRANSLATOR_KEY` | Microsoft Translator API Key | `your-api-key` |
| `MICROSOFT_TRANSLATOR_LOCATION` | API リージョン | `japaneast` |

> **注意:** サービスアカウントや秘密鍵は *絶対にコミットしない* でください。

## デプロイ

このアプリケーションはVercelにデプロイされています。
環境変数はVercelのダッシュボードで設定する必要があります。

デモサイト: https://koreanword.vercel.app

## 今後の開発予定

- 単語インポート（CSV / TSV）
- モバイル UI の最適化
- 学習進捗管理機能の強化

## ライセンス

MIT © 2025 HUYUMI-max
