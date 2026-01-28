import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ message: 'Token dan kata sandi baru wajib diisi.' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ message: 'Kata sandi minimal 8 karakter.' }, { status: 400 });
        }

        // 1. Hash the incoming token to compare with the one in DB
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Find user with this token and ensure it's not expired
        const { data: user, error: fetchError } = await supabaseAdminClient
            .from('profiles')
            .select('id, reset_token_expires')
            .eq('reset_token', tokenHash)
            .maybeSingle();

        if (fetchError || !user) {
            return NextResponse.json({ message: 'Token tidak valid atau telah kedaluwarsa.' }, { status: 400 });
        }

        // 3. Check expiry
        if (new Date(user.reset_token_expires) < new Date()) {
            return NextResponse.json({ message: 'Token telah kedaluwarsa.' }, { status: 400 });
        }

        // 4. Hash new password
        const passwordHash = await bcrypt.hash(password, 12);

        // 5. Update password and clear token
        const { error: updateError } = await supabaseAdminClient
            .from('profiles')
            .update({
                password_hash: passwordHash,
                reset_token: null,
                reset_token_expires: null
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Database error in reset-password:', updateError.message);
            return NextResponse.json({ message: 'Gagal memperbarui kata sandi.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Kata sandi berhasil diperbarui.' });
    } catch (error) {
        console.error('Unexpected error in reset-password API:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan sistem.' }, { status: 500 });
    }
}
