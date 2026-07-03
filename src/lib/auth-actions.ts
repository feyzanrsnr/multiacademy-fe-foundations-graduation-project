'use server';

import db from './db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User } from '@/types';

// Kayıt Olma Aksiyonu (Register)
export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Lütfen tüm alanları doldurun.' };
  }

  try {
    // E-posta kontrolü
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return { error: 'Bu e-posta adresi zaten kullanımda.' };
    }

    // Şifreyi hash'leme
    const password_hash = await bcrypt.hash(password, 10);

    // Kullanıcıyı veritabanına ekleme
    const insert = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const result = insert.run(name, email, password_hash, 'user');

    const cookieStore = await cookies();

    // Otomatik giriş yaptırma (Cookie oluşturma)
    cookieStore.set('session', String(result.lastInsertRowid), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 Hafta geçerli
      path: '/',
    });

    return { success: true };
  } catch (error) {
    return { error: 'Kayıt sırasında bir hata oluştu.' };
  }
}

// Giriş Yapma Aksiyonu (Login)
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunludur.' };
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
    
    if (!user) {
      return { error: 'Hatalı e-posta veya şifre.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { error: 'Hatalı e-posta veya şifre.' };
    }

    const cookieStore = await cookies();
    // Başarılı giriş: Session Cookie'si bırak
    cookieStore.set('session', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true };
  } catch (error) {
    return { error: 'Giriş yapılırken bir hata oluştu.' };
  }
}

// Çıkış Yapma Aksiyonu (Logout)
export async function logoutAction() {
  const cookieStore = await cookies(); // <-- Doğru yere, fonksiyon içine taşıdık!
  cookieStore.delete('session');
  return { success: true };
}

// Mevcut Aktif Kullanıcıyı Getirme Helpers'ı
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) return null;

  try {
    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(sessionId) as User | undefined;
    return user || null;
  } catch {
    return null;
  }
}

// ŞifDeğiştirme Aksiyonu
export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Lütfen tüm alanları doldurun.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Yeni şifreler eşleşmiyor.' };
  }

  if (newPassword.length < 6) {
    return { error: 'Yeni şifre en az 6 karakter olmalıdır.' };
  }

  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return { error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' };
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as User | undefined;

    if (!user) {
      return { error: 'Kullanıcı bulunamadı.' };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return { error: 'Mevcut şifre hatalı.' };
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(password_hash, sessionId);

    return { success: true };
  } catch (error) {
    return { error: 'Şifre değiştirilirken bir hata oluştu.' };
  }
}