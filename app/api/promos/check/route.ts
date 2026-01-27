import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code || typeof cartTotal !== 'number') {
            return NextResponse.json({ valid: false, message: 'Invalid request' }, { status: 400 });
        }

        const { data: promo, error } = await supabaseAdminClient
            .from('promos')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !promo) {
            return NextResponse.json({ valid: false, message: 'Kode promo tidak ditemukan' });
        }

        if (!promo.is_active) {
            return NextResponse.json({ valid: false, message: 'Kode promo tidak aktif' });
        }

        const now = new Date();
        const start = new Date(promo.start_date);
        const end = new Date(promo.end_date);

        console.info('[promo-check] validation details:', {
            code: promo.code,
            now: now.toISOString(),
            start: start.toISOString(),
            end: end.toISOString()
        });

        if (start > now || end < now) {
            return NextResponse.json({ valid: false, message: 'Kode promo sudah kedaluwarsa atau belum mulai' });
        }

        if (promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit) {
            return NextResponse.json({ valid: false, message: 'Kuota promo habis' });
        }

        if (cartTotal < promo.min_purchase) {
            return NextResponse.json({
                valid: false,
                message: `Minimal pembelian Rp ${new Intl.NumberFormat('id-ID').format(promo.min_purchase)}`
            });
        }

        // Calculate Discount
        let discountAmount = 0;
        if (promo.discount_type === 'Fixed') {
            discountAmount = promo.discount_value;
        } else {
            discountAmount = (cartTotal * promo.discount_value) / 100;
            if (promo.max_discount && discountAmount > promo.max_discount) {
                discountAmount = promo.max_discount;
            }
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        console.info('[promo-check] valid:', promo.code, 'discount:', discountAmount);
        return NextResponse.json({
            valid: true,
            promoCode: promo.code,
            discountAmount: Math.floor(discountAmount),
            message: 'Promo berhasil dipasang!'
        });

    } catch (error) {
        console.error('[promo-check] unexpected error:', error);
        return NextResponse.json({ valid: false, message: 'Terjadi kesalahan saat mengecek promo' }, { status: 500 });
    }
}
