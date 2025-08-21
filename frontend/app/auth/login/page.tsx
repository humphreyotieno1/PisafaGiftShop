'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const loginSchema = z.object({
  username: z.string().min(2, { message: 'Please enter your username' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, checkAuth, isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    // If already authenticated, redirect away
    const doRedirect = async () => {
      if (isAuthenticated) {
        const redirectParam = searchParams.get('redirect');
        const user = await checkAuth();
        if (redirectParam) {
          router.replace(redirectParam);
        } else if (user?.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      }
    };
    doRedirect();
  }, [isAuthenticated, checkAuth, router, searchParams]);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const result = await login(data.username, data.password, data.rememberMe);
      if (result.success) {
        toast({ title: 'Login successful', description: 'Welcome back!' });
        const redirectParam = searchParams.get('redirect');
        const user = await checkAuth();
        if (redirectParam) {
          router.replace(redirectParam);
        } else if (user?.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
        return;
      } else {
        toast({ 
          title: 'Login failed', 
          description: result.error || 'Invalid credentials',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({ 
        title: 'Error', 
        description: 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader className="space-y-1 p-6">
          <div className="flex justify-center mb-2">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to your account
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="yourusername"
                  className="pl-10 h-10"
                  {...register('username')}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
              </div>
              {errors.username && <p id="username-error" className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 h-10"
                  {...register('password')}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100 hover:scale-105 transition-all duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 hover:text-primary hover:rotate-6 transition-all duration-200" /> : <Eye className="h-4 w-4 hover:text-primary hover:rotate-6 transition-all duration-200" />}
                </Button>
              </div>
              {errors.password && <p id="password-error" className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                {...register('rememberMe')}
                aria-label="Remember me"
              />
              <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
              disabled={isLoading || Object.keys(errors).length > 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="p-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors duration-200">
            Sign up
          </Link>
        </CardFooter>
      </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}