'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.amroaltayeb14.workers.dev';

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json() as { error?: string; token?: string };

    if (!res.ok) {
      return { error: data.error || 'Invalid credentials' };
    }

    if (!data.token) {
      return { error: 'No token received' };
    }

    await setAuthCookie(data.token);
  } catch {
    return { error: 'Network error. Please try again.' };
  }

  redirect('/dashboard');
}

export async function signupAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const requiredAmount = formData.get('requiredAmount');
  const faculty = formData.get('faculty') as string;
  const semester = formData.get('semester') as string;

  if (!name || !email || !password || !requiredAmount || !faculty || !semester) {
    return { error: 'All fields are required' };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        whatsapp: whatsapp || undefined,
        requiredAmount: Number(requiredAmount),
        faculty,
        semester,
      }),
    });

    const data = await res.json() as { error?: string; token?: string };

    if (!res.ok) {
      return { error: data.error || 'Registration failed' };
    }

    if (!data.token) {
      return { error: 'No token received' };
    }

    await setAuthCookie(data.token);
  } catch {
    return { error: 'Network error. Please try again.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('jwt');
  redirect('/signin');
}