import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Edit, 
    Calendar, 
    User, 
    Clock, 
    BookOpen, 
    FileText,
    Users,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface MateriDetail {
    judul: string;
    deskripsi: string;
    poinPembelajaran: string[];
}

interface BatchDetail {
    id: number;
    nama: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    status: 'Draf' | 'Aktif' | 'Selesai';
    terdaftar: number;
}

interface SertifikasiDetail {
    id: number;
    nama_sertifikasi?: string;
    jenis_sertifikasi?: string;
    deskripsi?: string;
    modul?: { id?: number; judul?: string; deskripsi?: string; order?: number; poin_pembelajaran?: string[] }[];
    batch?: { id?: number; nama?: string; tanggal_mulai?: string; tanggal_selesai?: string; status?: string; peserta_terdaftar?: number }[];
    thumbnail_url?: string;
    nama_asesor?: string;
    jabatan_asesor?: string;
    instansi_asesor?: string;
    foto_asesor_url?: string;
    tipe_sertifikat?: string;
    kapasitas_peserta?: number;
    pengalaman_asesor?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

interface DetailSertifikasiProps {
    sertifikasi?: SertifikasiDetail;
    id?: string;
}

import { sertifikasiService } from '@/services/sertifikasiService';
import { useToast } from '@/components/ui/toast';
import { getStatusVariant, getStatusLabel } from '@/lib/formData';
import { DetailSkeleton } from '@/components/ui/skeletons';

export default function DetailSertifikasi({ sertifikasi, id }: DetailSertifikasiProps) {
    const [expandedMateri, setExpandedMateri] = useState<number[]>([]);
    const [data, setData] = useState<SertifikasiDetail | null>(sertifikasi || null);
    const [loading, setLoading] = useState(!sertifikasi);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Sertifikasi Kompetensi', href: '/admin/sertifikasi-kompetensi' },
        { title: 'Detail Sertifikasi', href: '#' }
    ];

    useEffect(() => {
        const load = async () => {
            if (!id || data) return;
            try {
                setLoading(true); setError(null);
                const res: any = await sertifikasiService.getSertifikasiById(Number(id));
                setData(res);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat detail');
                toast({ type: 'error', title: 'Gagal', message: err.message || 'Gagal memuat detail sertifikasi' });
            } finally { setLoading(false); }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Hitung total peserta terdaftar dari semua batch
    const totalPesertaTerdaftar = (data?.batch || []).reduce((total, batch: any) => total + (batch.peserta_terdaftar || batch.terdaftar || 0), 0);

    // Fungsi untuk menghitung durasi berdasarkan jadwal
    const calculateDuration = (jadwal: string) => {
        // Parse jadwal format "21-05-2025 sd 21-06-2025"
        const parts = jadwal.split(' sd ');
        if (parts.length !== 2) return 'Tidak dapat dihitung';
        
        try {
            const [startStr, endStr] = parts;
            const [startDay, startMonth, startYear] = startStr.split('-').map(Number);
            const [endDay, endMonth, endYear] = endStr.split('-').map(Number);
            
            const startDate = new Date(startYear, startMonth - 1, startDay);
            const endDate = new Date(endYear, endMonth - 1, endDay);
            
            // Hitung selisih hari
            const diffTime = endDate.getTime() - startDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 0) return 'Tidak valid';
            
            // Konversi ke format yang lebih readable
            const months = Math.floor(diffDays / 30);
            const weeks = Math.floor((diffDays % 30) / 7);
            const days = diffDays % 7;
            
            let result = '';
            if (months > 0) result += `${months} bulan `;
            if (weeks > 0) result += `${weeks} minggu `;
            if (days > 0) result += `${days} hari`;
            
            return result.trim() || `${diffDays} hari`;
        } catch (error) {
            return 'Tidak dapat dihitung';
        }
    };

    const handleEdit = () => { if (data?.id) router.visit(`/admin/form-sertifikasi/${data.id}`); };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Memuat Detail Sertifikasi" />
                <div className="p-6">
                    <DetailSkeleton blocks={4} />
                </div>
            </AppLayout>
        );
    }
    if (error || !data) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Gagal Memuat" />
                <div className="p-8 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Coba Lagi</Button>
                </div>
            </AppLayout>
        );
    }

    const toggleMateriExpand = (index: number) => {
        setExpandedMateri(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail - ${data.nama_sertifikasi || 'Sertifikasi'}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/admin/sertifikasi-kompetensi">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">{data.nama_sertifikasi}</h1>
                            <p className="text-muted-foreground">Detail program sertifikasi kompetensi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={handleEdit}
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Sertifikasi
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overview Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Informasi Umum</CardTitle>
                                    <Badge variant={data.jenis_sertifikasi === 'BNSP' ? 'default' : 'secondary'}>
                                        {data.jenis_sertifikasi}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Thumbnail */}
                                <div className="flex items-center gap-4">
                                    {data.thumbnail_url ? (
                                        <img src={data.thumbnail_url} alt="Thumbnail" className="h-24 w-32 rounded-lg object-cover border" />
                                    ) : (
                                        <div className="h-24 w-32 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">IMG</div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{data.nama_sertifikasi}</h3>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            ID: CERT-{(data.id || 0).toString().padStart(4, '0')}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Key Information */}
                                <div className="grid grid-cols-1 gap-4">
                                    {(data.batch || []).slice(0,1).map((b:any) => (
                                        <div key={b.id || 'first'} className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Periode Batch Pertama</p>
                                                <p className="font-medium">{b.tanggal_mulai} - {b.tanggal_selesai}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Jumlah Modul</p>
                                            <p className="font-medium">{(data.modul || []).length} modul</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Description */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <h4 className="font-semibold">Deskripsi Program</h4>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {data.deskripsi}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Materi Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Materi Pembelajaran</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {(data.modul || []).sort((a:any,b:any)=> (a.order||0)-(b.order||0)).map((item: any, index: number) => {
                                        const isExpanded = expandedMateri.includes(index);
                                        return (
                                            <div key={index} className="border rounded-lg overflow-hidden">
                                                <div 
                                                    className="flex items-center gap-3 p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                                    onClick={() => toggleMateriExpand(index)}
                                                >
                                                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{item.judul}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{item.deskripsi}</p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {isExpanded && item.poin_pembelajaran && (
                                                    <div className="p-4 pt-0">
                                                        <div className="bg-white rounded-lg p-4 border-l-4 border-primary/20">
                                                            <h5 className="font-medium text-sm mb-3 text-primary">Poin Pembelajaran:</h5>
                                                            <ul className="space-y-2">
                                                                {item.poin_pembelajaran.map((poin: string, poinIndex: number) => (
                                                                    <li key={poinIndex} className="flex items-start gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                                                        <span className="text-sm text-muted-foreground">{poin}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Program</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant={getStatusVariant(data.status || 'draft')}>
                                        {getStatusLabel(data.status || 'draft')}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Peserta Terdaftar</span>
                                    <span className="font-medium text-green-600">{totalPesertaTerdaftar} Peserta</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Jadwal Batch */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Jadwal Batch</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    {(data.batch || []).map((batch: any) => (
                                        <div key={batch.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{batch.nama}</h4>
                                                <Badge variant={batch.status?.toLowerCase() === 'aktif' ? 'default' : batch.status?.toLowerCase() === 'selesai' ? 'destructive' : 'secondary'}>
                                                    {batch.status ? batch.status.charAt(0).toUpperCase()+batch.status.slice(1).toLowerCase() : ''}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {batch.tanggal_mulai} - {batch.tanggal_selesai}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-muted-foreground">Peserta Terdaftar</span>
                                                <span className="text-sm font-medium text-blue-600">{batch.peserta_terdaftar || 0} orang</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detail Assessor */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Detail Assessor</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Foto Assessor */}
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                                        IMG
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-base">{data.nama_asesor}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {data.jabatan_asesor}
                                        </p>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                {/* Detail Informasi Assessor */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Nama</span>
                                        <span className="text-sm font-medium">{data.nama_asesor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Jabatan</span>
                                        <span className="text-sm font-medium">{data.jabatan_asesor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Instansi</span>
                                        <span className="text-sm font-medium">{data.instansi_asesor}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Sistem</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Dibuat</span>
                                    <span>{data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID') : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Diperbarui</span>
                                    <span>{data.updated_at ? new Date(data.updated_at).toLocaleDateString('id-ID') : '-'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
