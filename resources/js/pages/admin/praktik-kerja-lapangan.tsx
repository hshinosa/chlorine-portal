import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, MoreVertical, Briefcase, MapPin, Clock, Users, Eye, Loader2 } from 'lucide-react';
import { pklService } from '@/services/pklService';
import type { PosisiPKL } from '@/types/api';
import { useToast } from '@/components/ui/toast';
import { ListSkeleton } from '@/components/ui/skeletons';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

// Using backend PosisiPKL type
type PosisiPKLView = PosisiPKL;

export default function PraktikKerjaLapangan() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Praktik Kerja Lapangan', href: '/admin/praktik-kerja-lapangan' }
    ];

    // State management (API driven)
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tipeFilter, setTipeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [positions, setPositions] = useState<PosisiPKLView[]>([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingPosisi, setEditingPosisi] = useState<PosisiPKLView | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingPosisi, setDeletingPosisi] = useState<PosisiPKLView | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<PosisiPKL>>({
        nama_posisi: '', perusahaan: '', deskripsi: '', persyaratan: '', lokasi: '', tipe: 'Full-time', durasi_bulan: 1, kuota: 1, status: 'Aktif', tanggal_mulai: '', tanggal_selesai: '', contact_person: '', contact_email: '', contact_phone: ''
    });
    const { toast } = useToast();
    const isDirtyRef = useRef(false);
    useUnsavedChanges(isDirtyRef.current);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, tipeFilter]);

    // Fetch positions from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                const filters: Record<string, any> = {};
                if (searchQuery) filters.search = searchQuery;
                if (statusFilter) filters.status = statusFilter;
                if (tipeFilter) filters.tipe = tipeFilter;
                const data = await pklService.getPKLPositions(currentPage, filters);
                setPositions(data.data);
                setLastPage(data.last_page);
                setTotalItems(data.total);
                setItemsPerPage(data.per_page);
            } catch (e: any) {
                setError(e.message || 'Gagal memuat posisi PKL');
                toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal memuat posisi PKL' });
            } finally { setLoading(false); }
        };
        fetchData();
    }, [currentPage, searchQuery, statusFilter, tipeFilter]);

    // Simple stats (current page)
    const totalPosisi = totalItems;
    const posisiAktif = positions.filter(p => p.status === 'Aktif').length;
    const posisiNonAktif = positions.filter(p => p.status === 'Non-Aktif').length;
    const posisiPenuh = positions.filter(p => p.status === 'Penuh').length;
    const posisiRemote = positions.filter(p => p.tipe === 'Remote').length;

    const paginatedData = positions; // already paginated by backend

    const resetDirty = () => { isDirtyRef.current = false; };
    const markDirty = () => { if (showFormModal) isDirtyRef.current = true; };
    useEffect(()=>{ markDirty(); /* eslint-disable-next-line */ }, [formData]);

    const handleAddPosisi = () => { setEditingPosisi(null); setFormData({ nama_posisi: '', perusahaan: '', deskripsi: '', persyaratan: '', lokasi: '', tipe: 'Full-time', durasi_bulan: 1, kuota: 1, status: 'Aktif', tanggal_mulai: '', tanggal_selesai: '', contact_person: '', contact_email: '', contact_phone: '' }); setShowFormModal(true); resetDirty(); };
    const handleEditPosisi = (posisi: PosisiPKLView) => { setEditingPosisi(posisi); setFormData({ ...posisi }); setShowFormModal(true); resetDirty(); };
    const handleDeletePosisi = (posisi: PosisiPKLView) => { setDeletingPosisi(posisi); setShowDeleteModal(true); };
    const handleViewPosisi = (posisi: PosisiPKLView) => { window.location.href = `/admin/detail-pkl/${posisi.id}`; };

    const handleFormSubmit = async () => {
        setSubmitting(true); setError(null);
        try {
            if (editingPosisi) {
                const updated = await pklService.updatePKLPosition(editingPosisi.id, formData);
                setPositions(prev => prev.map(p => p.id === updated.id ? updated : p));
                toast({ type: 'success', title: 'Tersimpan', message: 'Posisi PKL diperbarui' });
            } else {
                const created = await pklService.createPKLPosition(formData);
                setPositions(prev => [created, ...prev]);
                toast({ type: 'success', title: 'Tersimpan', message: 'Posisi PKL dibuat' });
            }
            setShowFormModal(false); setEditingPosisi(null); resetDirty();
        } catch (e: any) { setError(e.message || 'Gagal menyimpan posisi'); toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal menyimpan posisi' }); } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!deletingPosisi) return; setSubmitting(true); setError(null);
        try {
            await pklService.deletePKLPosition(deletingPosisi.id);
            setPositions(prev => prev.filter(p => p.id !== deletingPosisi.id));
            setShowDeleteModal(false); setDeletingPosisi(null);
            toast({ type: 'success', title: 'Dihapus', message: 'Posisi PKL dihapus' });
        } catch (e: any) { setError(e.message || 'Gagal menghapus posisi'); toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal menghapus posisi' }); } finally { setSubmitting(false); }
    };

    const getStatusVariant = (s: string) => s === 'Aktif' ? 'default' : s === 'Penuh' ? 'destructive' : 'secondary';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Praktik Kerja Lapangan" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Praktik Kerja Lapangan</h1>
                        <p className="text-muted-foreground font-serif">
                            Kelola posisi PKL untuk mahasiswa dan fresh graduate
                        </p>
                    </div>
                    <Button onClick={handleAddPosisi} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Posisi PKL
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalPosisi}</div>
                                    <p className="text-sm text-muted-foreground">Total Posisi PKL</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{posisiAktif}</div>
                                    <p className="text-sm text-muted-foreground">Posisi Aktif</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{posisiNonAktif}</div>
                                    <p className="text-sm text-muted-foreground">Non-Aktif</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{posisiPenuh}</div>
                                    <p className="text-sm text-muted-foreground">Penuh</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{posisiRemote}</div>
                                    <p className="text-sm text-muted-foreground">Remote</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Posisi PKL</CardTitle>
                            <div className="flex items-center gap-2">
                                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari posisi PKL..." className="w-56" />
                                <select className="border rounded px-2 py-1 text-sm" value={tipeFilter} onChange={e => setTipeFilter(e.target.value)}>
                                    <option value="">Tipe</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                <select className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                    <option value="">Status</option>
                                    <option value="Aktif">Aktif</option>
                                    <option value="Non-Aktif">Non-Aktif</option>
                                    <option value="Penuh">Penuh</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
                        {loading && <ListSkeleton className="mb-4" rows={5} />}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Posisi</TableHead>
                                    <TableHead>Perusahaan</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Pendaftar</TableHead>
                                    <TableHead>Durasi</TableHead>
                                    <TableHead className="w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                                <TableBody>
                                    {!loading && paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div className="font-semibold">{item.nama_posisi}</div>
                                                    <div className="text-xs text-muted-foreground max-w-xs truncate">{item.lokasi}</div>
                                                </TableCell>
                                                <TableCell>{item.perusahaan}</TableCell>
                                                <TableCell><Badge>{item.tipe}</Badge></TableCell>
                                                <TableCell><Badge variant={getStatusVariant(item.status)}>{item.status}</Badge></TableCell>
                                                <TableCell>{item.jumlah_pendaftar}</TableCell>
                                                <TableCell>{item.durasi_bulan} bln</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewPosisi(item)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditPosisi(item)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDeletePosisi(item)}
                                                                variant="destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                {searchQuery
                                                    ? 'Tidak ada data yang sesuai dengan pencarian'
                                                    : 'Tidak ada data posisi PKL'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                    </CardContent>

                        {/* Pagination */}
                        {lastPage > 1 && (
                        <div className="border-t">
                            <Pagination
                                currentPage={currentPage}
                                    totalPages={lastPage}
                                    itemsPerPage={itemsPerPage}
                                totalItems={totalItems}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={() => {}}
                            />
                        </div>
                    )}
                </Card>

                    {/* Form Modal (inline) */}
                    <Dialog open={showFormModal} onOpenChange={(o)=>{ if(!o && isDirtyRef.current){ if(!confirm('Perubahan belum disimpan, tutup?')) return; } setShowFormModal(o); if(!o) resetDirty(); }}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{editingPosisi ? 'Edit Posisi PKL' : 'Tambah Posisi PKL'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Nama Posisi</label>
                                        <input className="w-full rounded border px-3 py-2 text-sm" value={formData.nama_posisi || ''} onChange={e=>setFormData({...formData,nama_posisi:e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Perusahaan</label>
                                        <input className="w-full rounded border px-3 py-2 text-sm" value={formData.perusahaan || ''} onChange={e=>setFormData({...formData,perusahaan:e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Tipe</label>
                                        <select className="w-full rounded border px-3 py-2 text-sm" value={formData.tipe} onChange={e=>setFormData({...formData,tipe:e.target.value as any})}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Durasi (bulan)</label>
                                        <input type="number" className="w-full rounded border px-3 py-2 text-sm" value={formData.durasi_bulan || ''} onChange={e=>setFormData({...formData,durasi_bulan:Number(e.target.value)})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Kuota</label>
                                        <input type="number" className="w-full rounded border px-3 py-2 text-sm" value={formData.kuota || ''} onChange={e=>setFormData({...formData,kuota:Number(e.target.value)})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Gaji (opsional)</label>
                                        <input type="number" className="w-full rounded border px-3 py-2 text-sm" value={formData.gaji ?? ''} onChange={e=>setFormData({...formData,gaji:e.target.value?Number(e.target.value):undefined})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Tanggal Mulai</label>
                                        <input type="date" className="w-full rounded border px-3 py-2 text-sm" value={formData.tanggal_mulai || ''} onChange={e=>setFormData({...formData,tanggal_mulai:e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Tanggal Selesai</label>
                                        <input type="date" className="w-full rounded border px-3 py-2 text-sm" value={formData.tanggal_selesai || ''} onChange={e=>setFormData({...formData,tanggal_selesai:e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Lokasi</label>
                                        <input className="w-full rounded border px-3 py-2 text-sm" value={formData.lokasi || ''} onChange={e=>setFormData({...formData,lokasi:e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Contact Person</label>
                                        <input className="w-full rounded border px-3 py-2 text-sm" value={formData.contact_person || ''} onChange={e=>setFormData({...formData,contact_person:e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Contact Email</label>
                                        <input type="email" className="w-full rounded border px-3 py-2 text-sm" value={formData.contact_email || ''} onChange={e=>setFormData({...formData,contact_email:e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Contact Phone</label>
                                        <input className="w-full rounded border px-3 py-2 text-sm" value={formData.contact_phone || ''} onChange={e=>setFormData({...formData,contact_phone:e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Status</label>
                                        <select className="w-full rounded border px-3 py-2 text-sm" value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value as any})}>
                                            <option value="Aktif">Aktif</option>
                                            <option value="Non-Aktif">Non-Aktif</option>
                                            <option value="Penuh">Penuh</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Persyaratan</label>
                                    <textarea className="w-full rounded border px-3 py-2 text-sm min-h-[100px]" value={formData.persyaratan || ''} onChange={e=>setFormData({...formData,persyaratan:e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Deskripsi</label>
                                    <textarea className="w-full rounded border px-3 py-2 text-sm min-h-[100px]" value={formData.deskripsi || ''} onChange={e=>setFormData({...formData,deskripsi:e.target.value})} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={()=>setShowFormModal(false)}>Batal</Button>
                                <Button onClick={handleFormSubmit} disabled={submitting}>{submitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</span> : (editingPosisi ? 'Simpan Perubahan' : 'Tambah Posisi')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                {/* Delete Modal */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Hapus Posisi PKL</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground">
                                Apakah Anda yakin ingin menghapus posisi "<strong>{deletingPosisi?.nama_posisi}</strong>"? 
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingPosisi(null);
                                }}
                            >
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
