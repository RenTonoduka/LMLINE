'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function SimpleRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/simple-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('アカウントを作成しました！');
        router.push('/auth/simple-login');
      } else {
        toast.error(result.error || 'アカウント作成に失敗しました');
      }
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">簡易新規登録</CardTitle>
          <CardDescription>
            テスト用のアカウントを作成して学習を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                type="text"
                placeholder="田中太郎"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              アカウントを作成
            </Button>
          </form>
          
          <div className="text-center text-sm">
            既にアカウントをお持ちの方は{' '}
            <Link href="/auth/simple-login" className="text-primary hover:underline">
              ログイン
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/auth/register" className="text-primary hover:underline">
              Firebaseを使用した新規登録
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}