export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message: string = '認証エラーが発生しました') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'アクセス権限がありません') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '入力データが無効です') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '競合が発生しました') {
    super(message, 409);
  }
}

// Error handling utilities
export const errorMessages = {
  // Authentication errors
  'auth/invalid-email': 'メールアドレスの形式が正しくありません',
  'auth/user-disabled': 'このアカウントは無効化されています',
  'auth/user-not-found': 'ユーザーが見つかりません',
  'auth/wrong-password': 'パスワードが正しくありません',
  'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
  'auth/weak-password': 'パスワードが弱すぎます。6文字以上で設定してください',
  'auth/too-many-requests': 'リクエストが多すぎます。しばらく時間をおいて再試行してください',
  'auth/network-request-failed': 'ネットワークエラーが発生しました',
  'auth/requires-recent-login': '再度ログインしてから実行してください',

  // General errors
  'network-error': 'ネットワークエラーが発生しました',
  'server-error': 'サーバーエラーが発生しました',
  'unknown-error': '不明なエラーが発生しました',
  
  // Validation errors
  'required-field': 'この項目は必須です',
  'invalid-format': '形式が正しくありません',
  'password-mismatch': 'パスワードが一致しません',
  'file-too-large': 'ファイルサイズが大きすぎます',
  'invalid-file-type': 'サポートされていないファイル形式です',
};

export function getErrorMessage(error: any): string {
  // Firebase Auth errors
  if (error?.code && errorMessages[error.code as keyof typeof errorMessages]) {
    return errorMessages[error.code as keyof typeof errorMessages];
  }

  // Custom app errors
  if (error instanceof AppError) {
    return error.message;
  }

  // Network errors
  if (error?.message?.includes('fetch')) {
    return errorMessages['network-error'];
  }

  // Default to error message or unknown error
  return error?.message || errorMessages['unknown-error'];
}

export function logError(error: any, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      error,
      context,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });
  }

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

export function handleAsyncError<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, fn.name);
      throw error;
    }
  }) as T;
}

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    logError(error, context);
    const message = getErrorMessage(error);
    
    // You can integrate with a toast library here
    // For now, we'll just return the message
    return message;
  };

  return { handleError };
}