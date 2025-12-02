'use client';
import type { Credentials } from '@/api/auth/signin/type';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ribbon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export function SigninForm() {
  const { register, handleSubmit } = useForm<Credentials>();
  const router = useRouter();

  async function onSubmit(data: Credentials) {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    // --- pastikan body ada sebelum parse JSON
    let responseData = null;
    try {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : null;
    } catch (err) {
      console.warn('Response tidak valid JSON', err);
    }

    // refresh cache dan pindah halaman
    router.refresh();
    router.push('/'); // ⬅ ganti redirect()
  }

  return (
    <Card className='mx-auto max-w-sm'>
      <CardHeader>
        <div className='flex gap-3 mb-4'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground'>
            <Ribbon className='size-5' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='-ml-[0.1rem] truncate font-semibold'>SIBANDES</span>
            <span className='truncate text-xs'>SI Bantuan Desa</span>
          </div>
        </div>
        <CardTitle className='text-2xl'>Sign in</CardTitle>
        <CardDescription>Enter your email below to sign in to your account.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' required {...register('email')} />
            </div>

            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
                <Link href='#' className='ml-auto inline-block text-sm underline'>
                  Forgot your password?
                </Link>
              </div>
              <Input id='password' type='password' required {...register('password')} />
            </div>

            <Button type='submit' className='w-full'>
              Login
            </Button>
          </div>
        </form>

        <div className='mt-4 text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link href='/signup' className='underline'>Sign up</Link>
        </div>
      </CardContent>
    </Card>
  );
}
