import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Nama, email, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingUser, error: fetchError } = await supabaseAdminClient
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { message: 'Gagal memeriksa email.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { error: insertError } = await supabaseAdminClient.from('profiles').insert({
      name,
      email: normalizedEmail,
      phone: phone ?? null,
      password_hash: passwordHash,
      role: 'user'
    });

    if (insertError) {
      return NextResponse.json(
        { message: 'Gagal menyimpan data pengguna.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Registrasi berhasil.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Terjadi kesalahan tidak terduga.' },
      { status: 500 }
    );
  }
}
