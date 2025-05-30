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
import { useSimpleAuth } from '@/contexts/simple-auth-context';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SimpleLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useSimpleAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">簡易ログイン</CardTitle>
          <CardDescription>
            テスト用アカウントでログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              ログイン
            </Button>
          </form>
          
          <div className="text-center text-sm">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/simple-register" className="text-primary hover:underline">
              新規登録
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Firebaseを使用したログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}