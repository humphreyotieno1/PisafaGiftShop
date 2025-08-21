'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast() as any;
  const token = searchParams.get('token');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
    }
  }, [token])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, values.password)
      if (true) {
        setIsSuccess(true);
        toast({ title: 'Password reset successful', description: 'Your password has been reset. You can now log in with your new password.' });
      } else {
        // no-op
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isValidating) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Validating your reset link...</p>
        </div>
      );
    }

    if (!isValidToken) {
      return (
        <div className="space-y-4 text-center py-4">
          <h3 className="text-lg font-medium">Invalid or expired link</h3>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            variant="outline"
            className="w-full hover:bg-gray-100 hover:scale-105 transition-all duration-200"
            onClick={() => router.push('/auth/forgot-password')}
          >
            Request new link
          </Button>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="space-y-4 text-center py-4">
          <h3 className="text-lg font-medium">Password reset successful</h3>
          <p className="text-muted-foreground">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Button
            variant="outline"
            className="w-full hover:bg-gray-100 hover:scale-105 transition-all duration-200"
            onClick={() => router.push('/auth/login')}
          >
            Go to login
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium leading-none">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
              {...form.register('password')}
              aria-describedby={form.formState.errors.password ? 'password-error' : undefined}
            />
          </div>
          {form.formState.errors.password && <p id="password-error" className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
              {...form.register('confirmPassword')}
              aria-describedby={form.formState.errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
          </div>
          {form.formState.errors.confirmPassword && <p id="confirmPassword-error" className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
        </div>
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>
    );
  };

  return (
    <div className="w-full">
      <div className="border rounded-lg shadow-sm">
        <div className="space-y-1 p-6">
          <div className="flex justify-center mb-2">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-center">
            {isSuccess ? 'Password Reset' : 'Reset Your Password'}
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            {isSuccess 
              ? 'Your password has been updated successfully.' 
              : 'Enter your new password below.'}
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {renderContent()}
          </div>
        </div>
        {!isSuccess && (
          <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link 
              href="/auth/login" 
              className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}