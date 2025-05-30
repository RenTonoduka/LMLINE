# LMS×LINE AI Support System

LINEと連携したAI搭載の学習管理システム（LMS）です。Next.js 14、TypeScript、Firebase、Prismaを使用して構築されています。

## 🚀 機能

### Phase 1: Foundation (基盤構築) - ✅ 完了
- ✅ Next.js 14プロジェクトセットアップ（TypeScript対応）
- ✅ Firebase Authentication統合
- ✅ PostgreSQL + Prisma ORM セットアップ
- ✅ 基本的なプロジェクト構造と依存関係

### Sprint 1: UI Foundation and Dashboard - ✅ 完了
- ✅ 共有UIコンポーネント（Button, Input, Card）
- ✅ レイアウトシステム（Header, Footer, Layout）
- ✅ Firebase認証状態管理
- ✅ ランディングページとダッシュボード
- ✅ 認証API

## 🛠 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: React Query (@tanstack/react-query)
- **UI Components**: Radix UI + Tailwind CSS
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Container**: Docker & Docker Compose

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── auth/         # 認証関連API
│   ├── auth/             # 認証ページ
│   ├── dashboard/        # ダッシュボード
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # ランディングページ
├── components/           # Reactコンポーネント
│   ├── auth/            # 認証コンポーネント
│   ├── layout/          # レイアウトコンポーネント
│   ├── sections/        # ページセクション
│   └── ui/              # 再利用可能なUIコンポーネント
├── contexts/            # Reactコンテキスト
├── hooks/               # カスタムフック
├── lib/                 # ユーティリティとライブラリ
├── styles/              # スタイリング
└── types/               # TypeScript型定義
```

## 🔧 セットアップ手順

### 🐳 Docker を使用する場合（推奨）

Docker環境での起動が最も簡単です。PostgreSQL、Redis、アプリケーションが自動的にセットアップされます。

#### 前提条件
- Docker
- Docker Compose

#### 起動手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd LMLINE
```

2. **環境変数の設定**
```bash
# .env.exampleをコピーして.envを作成
cp .env.example .env

# .envファイルを編集して必要な値を設定
nano .env
```

3. **Docker起動（本番環境）**
```bash
# 起動スクリプトを使用（推奨）
./docker-start.sh

# または手動で起動
docker-compose up -d --build
```

4. **Docker起動（開発環境）**
```bash
# 開発環境での起動
docker-compose -f docker-compose.dev.yml up -d --build
```

#### Docker コマンド

```bash
# アプリケーションの起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# データベースマイグレーション
docker-compose exec app npx prisma migrate deploy

# サービスの停止
docker-compose down

# ボリュームも含めて完全削除
docker-compose down --volumes --remove-orphans
```

#### 利用可能なサービス

| サービス | URL | 説明 |
|---------|-----|------|
| Web App | http://localhost:3000 | メインアプリケーション |
| PostgreSQL | localhost:5432 | データベース |
| Redis | localhost:6379 | キャッシュ・セッションストア |

### 💻 ローカル開発環境の場合

Dockerを使用しない場合の従来のセットアップ方法です。

#### 前提条件
- Node.js 18以上
- PostgreSQL
- Redis（オプション）

#### セットアップ手順

1. **依存関係のインストール**
```bash
npm install
```

2. **環境変数の設定**
`.env.example`をコピーして`.env.local`を作成し、必要な環境変数を設定してください：
```bash
cp .env.example .env.local
```

必要な環境変数：
- Firebase設定（認証用）
- PostgreSQLデータベースURL
- その他のAPI キー

3. **データベースのセットアップ**
```bash
# Prismaクライアントの生成
npm run db:generate

# データベースマイグレーション
npm run db:migrate

# 初期データの投入（オプション）
npm run db:seed
```

4. **開発サーバーの起動**
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

## 📝 利用可能なスクリプト

- `npm run dev` - 開発サーバーの起動
- `npm run build` - プロダクション用ビルド
- `npm run start` - プロダクションサーバーの起動
- `npm run lint` - ESLintによるコードチェック
- `npm run lint:fix` - ESLintによる自動修正
- `npm run format` - Prettierによるコードフォーマット
- `npm run type-check` - TypeScriptの型チェック
- `npm run db:generate` - Prismaクライアントの生成
- `npm run db:push` - データベーススキーマの同期
- `npm run db:migrate` - データベースマイグレーション実行
- `npm run db:studio` - Prisma Studioの起動
- `npm run db:seed` - 初期データの投入

## 🎨 UI/UXデザイン

- **デザインシステム**: Tailwind CSSベースのカスタムデザインシステム
- **コンポーネント**: Radix UI + shadcn/ui インスパイア
- **レスポンシブ**: モバイルファーストデザイン
- **ダークモード**: Next Themesによるダークモード対応
- **アクセシビリティ**: WAI-ARIA準拠

## 🔐 認証システム

- **Firebase Authentication**を使用
- サポートする認証方法：
  - メール/パスワード
  - Googleアカウント
- ユーザー情報はFirebaseとPostgreSQLの両方で管理
- JWT トークンベースの認証

## 📊 データベース設計

Prismaスキーマで定義された主要なモデル：

- **User**: ユーザー情報
- **Course**: コース情報
- **Chapter**: チャプター情報
- **Enrollment**: 受講状況
- **Assignment**: 課題情報
- **Submission**: 提出物
- **ChatMessage**: チャットメッセージ
- **Notification**: 通知情報

## 🚧 今後の開発予定

### Phase 2: Core LMS Features
- [ ] コース管理機能
- [ ] チャプター・動画管理
- [ ] 課題・提出機能
- [ ] 進捗管理システム

### Phase 3: AI Integration
- [ ] OpenAI API統合
- [ ] AI学習アシスタント
- [ ] 自動質問応答システム

### Phase 4: LINE Integration
- [ ] LINE Messaging API統合
- [ ] LINEボット機能
- [ ] LINE通知システム

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. プロジェクトをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesまたは以下の連絡先までお問い合わせください：

- Email: support@lms-line.com
- LINE: [@lms-support](https://line.me/R/ti/p/@lms-support)

---

**LMS×LINE AI Support** - 学習を変革する次世代プラットフォーム