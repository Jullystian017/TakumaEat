import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email wajib diisi.' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Find user in profiles table
        const { data: user, error: fetchError } = await supabaseAdminClient
            .from('profiles')
            .select('id, email, name')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching user:', fetchError);
            return NextResponse.json({ message: 'Terjadi kesalahan sistem.' }, { status: 500 });
        }

        // Safety: Always return same success message to prevent email enumeration (Hacker safety)
        const successResponse = NextResponse.json({
            message: 'Jika email terdaftar, instruksi reset password akan dikirim ke email tersebut.'
        });

        if (!user) {
            return successResponse;
        }

        // 2. Generate secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

        // 3. Update profile with reset token and expiry
        // Warning: User must ensure 'reset_token' and 'reset_token_expires' columns exist in 'profiles'
        const { error: updateError } = await supabaseAdminClient
            .from('profiles')
            .update({
                reset_token: resetTokenHash,
                reset_token_expires: expiry.toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('DATABASE ERROR (Forgot Password):', updateError.message);
            // We don't return error to user to keep email enumeration safety, 
            // but developers can see it in logs.
            return successResponse;
        }

        // 4. Send Email Logic
        // In production, use Resend, Nodemailer, etc.
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        console.log('--------------------------------------------------');
        console.log('📧 FORGOT PASSWORD REQUEST');
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log('--------------------------------------------------');

        return successResponse;
    } catch (error) {
        console.error('Unexpected error in forgot-password API:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan sistem.' }, { status: 500 });
    }
}
