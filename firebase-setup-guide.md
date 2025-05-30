# Firebase Setup Guide

## 🔥 Firebase プロジェクト設定手順

### 1. Firebase Console でプロジェクト作成
1. https://console.firebase.google.com/ にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名入力（例：lms-line-ai-support）
4. Google Analytics を有効化（推奨）
5. プロジェクト作成完了

### 2. Authentication 設定
1. 左メニューから「Authentication」を選択
2. 「Sign-in method」タブを選択
3. 「Email/Password」を有効化
4. 「Google」を有効化
   - OAuth同意画面を設定
   - 承認済みドメイン追加（localhost:3001, your-domain.com）

### 3. ウェブアプリ追加
1. プロジェクト設定（歯車アイコン）
2. 「アプリを追加」→ ウェブアプリ（</>）を選択
3. アプリ名入力（例：LMS Web App）
4. Firebase SDK 設定コードをコピー

### 4. サービスアカウント設定
1. プロジェクト設定 → 「サービスアカウント」タブ
2. 「新しい秘密鍵の生成」をクリック
3. JSON ファイルをダウンロード
4. private_key と client_email をコピー

### 5. 環境変数設定

.env.local ファイルに以下を追加：

```env
# Firebase Configuration (from SDK設定)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:..."

# Firebase Admin (from サービスアカウント)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
```

### 6. 設定確認

環境変数設定後、開発サーバーを再起動：

```bash
docker-compose -f docker-compose.dev.yml restart app
```

### 7. テストログイン

1. http://localhost:3001/auth/login にアクセス
2. 新規登録またはGoogleログインを試行
3. ダッシュボードにリダイレクトされることを確認

## 🔍 現在の状況

- **データベース**: PostgreSQL（完全に動作中）
- **認証**: Firebase（デモ設定で動作、本格運用には設定が必要）
- **API**: 完全に実装済み
- **フロントエンド**: 完全に実装済み

## ⚠️ 注意事項

1. Firebase設定なしでも基本機能は動作します
2. 本格的なユーザー認証には Firebase 設定が必要
3. Google OAuth にはドメイン認証が必要
4. 本番環境では HTTPS が必須

## 🚀 次のステップ

設定完了後、以下の機能が完全に動作します：
- ユーザー登録・ログイン
- Google OAuth ログイン
- コース受講・進捗管理
- ダッシュボード機能
- セキュアなAPI アクセス