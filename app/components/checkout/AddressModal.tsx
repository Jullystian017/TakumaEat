'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { X, MapPin, Navigation, Map as MapIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Basic components can stay dynamic or be handled via the Map component
const MapContent = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-50 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
});

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: any) => void;
    editingAddress?: any;
}

export function AddressModal({ isOpen, onClose, onSave, editingAddress }: AddressModalProps) {
    const [formData, setFormData] = useState({
        recipient_name: '',
        phone_number: '',
        address_line: '',
        detail: '',
        latitude: -6.2088, // Default Jakarta
        longitude: 106.8456,
        is_default: false
    });
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState<[number, number]>([-6.2088, 106.8456]);
    const [isClient, setIsClient] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<any>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (editingAddress) {
            setFormData(editingAddress);
            if (editingAddress.latitude && editingAddress.longitude) {
                setPosition([editingAddress.latitude, editingAddress.longitude]);
            }
        } else {
            setFormData({
                recipient_name: '',
                phone_number: '',
                address_line: '',
                detail: '',
                latitude: -6.2088,
                longitude: 106.8456,
                is_default: false
            });
            setPosition([-6.2088, 106.8456]);
        }
    }, [editingAddress, isOpen]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Nominatim search with viewbox for Indonesia or bias
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5&addressdetails=1`);
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        }, 500); // Reduced delay for snappier feels
    };

    const selectSuggestion = (s: any) => {
        const newPos: [number, number] = [parseFloat(s.lat), parseFloat(s.lon)];
        setPosition(newPos);
        setSuggestions([]);
        setSearchQuery(s.display_name);

        // Auto-fill address line if empty
        if (!formData.address_line) {
            setFormData(prev => ({ ...prev, address_line: s.display_name }));
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsSearching(true);
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const newPos: [number, number] = [lat, lon];
                setPosition(newPos);

                try {
                    // Reverse geocoding to get readable address
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
                    const data = await res.json();
                    if (data.display_name) {
                        setFormData(prev => ({ ...prev, address_line: data.display_name }));
                        setSearchQuery(data.display_name);
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                } finally {
                    setIsSearching(false);
                }
            }, (err) => {
                console.warn('Geolocation error:', err);
                setIsSearching(false);
                alert('Tidak dapat mendeteksi lokasi. Pastikan izin lokasi aktif.');
            }, { enableHighAccuracy: true });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Filter payload to avoid sending generated fields (like id, created_at)
            const payload = {
                recipient_name: formData.recipient_name,
                phone_number: formData.phone_number,
                address_line: formData.address_line,
                detail: formData.detail,
                latitude: position[0],
                longitude: position[1],
                is_default: formData.is_default
            };

            const url = editingAddress ? `/api/user/addresses/${editingAddress.id}` : '/api/user/addresses';
            const method = editingAddress ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                onSave(data.address);
                onClose();
            } else {
                const errData = await res.json();
                alert(`Gagal menyimpan: ${errData.message || 'Terjadi kesalahan'}`);
            }
        } catch (err) {
            console.error('Save address error:', err);
            alert('Terjadi kesalahan saat menghubungkan ke server.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">{editingAddress ? 'Ubah Alamat' : 'Tambah Alamat Baru'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Penerima</label>
                            <input
                                required
                                type="text"
                                value={formData.recipient_name}
                                onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-brand-gold outline-none text-sm"
                                placeholder="Contoh: Budi Santoso"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
                            <input
                                required
                                type="tel"
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-brand-gold outline-none text-sm"
                                placeholder="08XXXXXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat Lengkap</label>
                        <textarea
                            required
                            rows={2}
                            value={formData.address_line}
                            onChange={e => setFormData({ ...formData, address_line: e.target.value })}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-gold outline-none text-sm resize-none"
                            placeholder="Jl. Raya No. 123, Kel. Merdeka, Kec. Juang..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Lokasi (Patokan/Lantai)</label>
                        <input
                            type="text"
                            value={formData.detail}
                            onChange={e => setFormData({ ...formData, detail: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-brand-gold outline-none text-sm"
                            placeholder="Contoh: Samping Masjid Al-Ikhlas / Lantai 3"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-brand-gold" /> Cari & Pin Lokasi
                            </label>
                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                className="text-[10px] font-bold text-brand-gold uppercase flex items-center gap-1 hover:underline"
                            >
                                <Navigation className="h-3 w-3" /> Gunakan Lokasi Saat Ini
                            </button>
                        </div>

                        <div className="relative group/search">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-brand-gold" /> : <MapIcon className="h-4 w-4" />}
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full h-12 pl-11 pr-12 rounded-2xl border border-slate-200 focus:border-brand-gold outline-none text-sm bg-slate-50 focus:bg-white transition-all shadow-sm focus:shadow-md"
                                placeholder="Cari gedung, perumahan, atau jalan..."
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-[110] mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 bg-slate-50 border-b border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Saran Lokasi</p>
                                    </div>
                                    <div className="max-h-[220px] overflow-y-auto">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => selectSuggestion(s)}
                                                className="w-full px-4 py-3.5 text-left text-xs hover:bg-amber-50 border-b border-slate-50 last:border-0 flex items-start gap-3 group/item transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-white transition-colors">
                                                    <MapPin className="h-4 w-4 text-slate-400 group-hover/item:text-brand-gold" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-700 group-hover/item:text-slate-900 truncate">{s.display_name.split(',')[0]}</p>
                                                    <p className="text-[11px] text-slate-400 line-clamp-1 group-hover/item:text-slate-500 mt-0.5">{s.display_name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-[250px] w-full rounded-2xl border border-slate-200 overflow-hidden relative z-0">
                            {isClient && (
                                <MapContent
                                    position={position}
                                    setPosition={setPosition}
                                />
                            )}
                            {!isClient && (
                                <div className="h-full w-full bg-slate-50 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 italic text-center">* Klik pada peta untuk memindahkan pin lokasi pengantaran</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_default"
                            checked={formData.is_default}
                            onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-brand-gold focus:ring-brand-gold"
                        />
                        <label htmlFor="is_default" className="text-sm font-medium text-slate-600">Jadikan alamat utama</label>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        onClick={(e) => handleSubmit(e as any)}
                        disabled={loading}
                        className="w-full h-12 rounded-2xl bg-brand-gold text-black font-bold uppercase tracking-widest shadow-lg shadow-brand-gold/20"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Simpan Alamat
                    </Button>
                </div>
            </div>
        </div>
    );
}
