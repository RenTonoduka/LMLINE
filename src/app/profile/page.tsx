'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Update profile via API
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken?.()}`,
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (response.ok) {
        await refreshUser();
        setMessage('プロフィールが更新されました');
      } else {
        throw new Error('プロフィールの更新に失敗しました');
      }
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              プロフィールにアクセスするにはログインが必要です
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プロフィール設定</h1>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">基本情報</h2>
              </CardHeader>
              <CardContent>
                {message && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-600">{message}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="お名前"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="山田太郎"
                  />

                  <Input
                    label="メールアドレス"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    helperText="メールアドレスは変更できません"
                  />

                  <div className="flex space-x-4">
                    <Button type="submit" loading={loading} disabled={loading}>
                      保存
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ name: user.name || '', email: user.email || '' })}
                    >
                      リセット
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">アカウント情報</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ユーザーID
                    </label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                      {user.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ロール
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      登録日
                    </label>
                    <p className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最終ログイン
                    </label>
                    <p className="text-sm text-gray-600">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('ja-JP')
                        : '未設定'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LINE Integration */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">LINE連携</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      LINE連携状態
                    </h3>
                    <div className="flex items-center space-x-2">
                      {user.lineUserId ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">連携済み</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <span className="text-sm text-gray-600">未連携</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    {user.lineUserId ? (
                      <Button variant="outline" size="sm">
                        連携解除
                      </Button>
                    ) : (
                      <Button size="sm">
                        LINE連携する
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  LINE連携により、学習リマインダーや進捗通知、AI個別サポートをLINEで受け取ることができます。
                </p>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-red-600">危険な操作</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-red-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      アカウント削除
                    </h3>
                    <p className="text-sm text-red-600 mb-4">
                      アカウントを削除すると、すべての学習データが失われます。この操作は取り消せません。
                    </p>
                    <Button variant="destructive" size="sm">
                      アカウントを削除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}