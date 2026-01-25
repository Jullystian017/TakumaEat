import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

// GET all menu items
export async function GET() {
    try {
        const { data, error } = await supabaseAdminClient
            .from('menu_items')
            .select(`
                *,
                categories:category_id (
                    name,
                    icon
                )
            `)
            .order('name');

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ menuItems: data });
    } catch (error) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}

// POST new menu item (Admin only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, category_id, price, stock, description, image_url, status, highlights, calories } = body;

        if (!name || !category_id || price === undefined) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabaseAdminClient
            .from('menu_items')
            .insert([{
                name,
                category_id,
                price,
                stock: stock || 0,
                description,
                image_url,
                status: status || (stock > 0 ? 'available' : 'out_of_stock'),
                highlights: highlights || [],
                calories
            }])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ menuItem: data }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}
