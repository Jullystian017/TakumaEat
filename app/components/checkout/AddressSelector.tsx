'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Check, ChevronRight, Edit2, Trash2, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AddressModal } from './AddressModal';

interface Address {
    id: string;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    detail?: string;
    latitude?: number;
    longitude?: number;
    is_default: boolean;
}

interface AddressSelectorProps {
    onSelect: (address: Address) => void;
    selectedAddressId?: string;
}

export function AddressSelector({ onSelect, selectedAddressId }: AddressSelectorProps) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/user/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses);

                // Auto-select default or first address if none selected
                if (!selectedAddressId && data.addresses.length > 0) {
                    const def = data.addresses.find((a: Address) => a.is_default) || data.addresses[0];
                    onSelect(def);
                }
            }
        } catch (err) {
            console.error('Fetch addresses error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Hapus alamat ini?')) return;
        try {
            await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
            fetchAddresses();
        } catch (err) {
            console.error('Delete address error:', err);
        }
    };

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#9a8871] uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-gold" /> Alamat Pengiriman
                </h3>
                <button
                    onClick={() => { setEditingAddress(undefined); setIsModalOpen(true); }}
                    className="text-[11px] font-bold text-brand-gold hover:underline flex items-center gap-1 uppercase"
                >
                    Tambah Baru
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-slate-50" />)}
                </div>
            ) : addresses.length === 0 ? (
                <button
                    onClick={() => { setEditingAddress(undefined); setIsModalOpen(true); }}
                    className="w-full flex flex-col items-center justify-center p-8 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-gold hover:text-brand-gold transition-all group"
                >
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-brand-gold/10 transition-colors" />
                    <p className="font-bold text-sm tracking-wide">Belum Ada Alamat Tersimpan</p>
                    <p className="text-xs mt-1">Klik untuk menambah alamat pengiriman pertamamu</p>
                </button>
            ) : (
                <div className="grid gap-3">
                    {addresses.map((address) => {
                        const isSelected = selectedAddressId === address.id;
                        return (
                            <div
                                key={address.id}
                                onClick={() => onSelect(address)}
                                className={cn(
                                    "relative group cursor-pointer p-5 rounded-[28px] border transition-all duration-300",
                                    isSelected
                                        ? "border-brand-gold bg-[#fae8c8]/20 shadow-lg shadow-brand-gold/5"
                                        : "border-slate-100 bg-white hover:border-slate-300 shadow-sm"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-bold text-slate-900">{address.recipient_name}</span>
                                            {address.is_default && (
                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-gold text-black">Utama</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 mb-1">{address.phone_number}</p>
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{address.address_line}</p>
                                        {address.detail && <p className="text-[10px] text-slate-400 mt-1 italic">Note: {address.detail}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {isSelected && (
                                            <div className="h-6 w-6 rounded-full bg-brand-gold flex items-center justify-center">
                                                <Check className="h-3 w-3 text-black" />
                                            </div>
                                        )}
                                        {!isSelected && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingAddress(address); setIsModalOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-brand-gold transition-colors"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isSelected && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingAddress(address); setIsModalOpen(true); }}
                                        className="absolute bottom-4 right-4 p-2 text-brand-gold/60 hover:text-brand-gold transition-colors"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedAddress && addresses.length > 1 && (
                <button
                    onClick={() => { }} // Could link to a full address book page
                    className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase text-center hover:text-brand-gold transition-colors"
                >
                    Tampilkan alamat lainnya <ChevronRight className="inline h-3 w-3" />
                </button>
            )}

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingAddress(undefined); }}
                onSave={(newAddr) => {
                    fetchAddresses();
                    if (newAddr?.id) onSelect(newAddr);
                }}
                editingAddress={editingAddress}
            />
        </div>
    );
}
