# LMS × LINE AI Support System

オンライン学習プラットフォーム（LMS）とLINE公式アカウント連携によるAI個別学習サポートシステム

## 技術スタック

- **フロントエンド**: Next.js 14, TypeScript, Tailwind CSS
- **認証**: Firebase Authentication
- **データベース**: PostgreSQL with Prisma ORM
- **AI**: OpenAI API / Claude API
- **LINE連携**: LINE Messaging API
- **インフラ**: AWS / Vercel

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 型チェック
npm run type-check

# リント
npm run lint

# テスト実行
npm test
```

## プロジェクト構造

```
src/
├── app/              # Next.js App Router
├── components/       # React コンポーネント
├── lib/             # ライブラリ・ユーティリティ
├── types/           # TypeScript型定義
├── hooks/           # カスタムフック
└── utils/           # ヘルパー関数
```

## 機能

### フェーズ1: LMS基本機能
- [ ] ユーザー認証 (Firebase Authentication)
- [ ] コース管理
- [ ] 学習機能
- [ ] 進捗管理

### フェーズ2: LINE連携
- [ ] LINE アカウント連携
- [ ] 通知機能

### フェーズ3: AI個別サポート
- [ ] 質問応答システム
- [ ] 学習進捗分析
- [ ] 個別学習プラン提案

## ライセンス

This project is licensed under the MIT License.