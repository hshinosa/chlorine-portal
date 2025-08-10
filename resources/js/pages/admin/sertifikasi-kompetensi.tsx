import { Head, Link, router } from '@inertiajs/react';
import { useState, ChangeEvent, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Eye, MoreVertical, Briefcase, MapPin, Clock, Users, Loader2, ImageOff } from 'lucide-react';

import { sertifikasiService } from '@/services/sertifikasiService';
import { ListSkeleton } from '@/components/ui/skeletons';
import { getStatusLabel, getStatusVariant } from '@/lib/formData';
import { useToast } from '@/components/ui/toast';
import type { Sertifikasi } from '@/types/api';

// Local view model (can extend backend fields when needed)
interface SertifikasiView extends Sertifikasi { thumbnail_url?: string }

export default function SertifikasiKompetensi() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Sertifikasi Kompetensi', href: '/admin/sertifikasi-kompetensi' }
    ];

    // State management (API driven)
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jenisFilter, setJenisFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10); // backend defined per_page
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Removed inline edit modal (editing now redirects)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedSertifikasi, setSelectedSertifikasi] = useState<SertifikasiView | null>(null);
    const [sertifikasi, setSertifikasi] = useState<SertifikasiView[]>([]);
    const { toast } = useToast();

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                const filters: any = {};
                if (searchQuery) filters.search = searchQuery;
                if (statusFilter) filters.status = statusFilter;
                if (jenisFilter) filters.jenis_sertifikasi = jenisFilter;
                const data = await sertifikasiService.getSertifikasi(currentPage, filters);
                setSertifikasi(data.data);
                setLastPage(data.last_page);
                setTotalItems(data.total);
                setItemsPerPage(data.per_page);
            } catch (e: any) {
                setError(e.message || 'Gagal memuat data sertifikasi');
                toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal memuat data sertifikasi' });
            } finally { setLoading(false); }
        };
        fetchData();
    }, [currentPage, searchQuery, statusFilter, jenisFilter]);

    // Calculate statistics (current page basis)
    const totalSertifikasi = totalItems;
    const sertifikasiAktif = sertifikasi.filter(item => item.status === 'aktif').length;
    const sertifikasiIndustri = sertifikasi.filter(item => item.jenis_sertifikasi === 'Industri').length;
    const sertifikasiBNSP = sertifikasi.filter(item => item.jenis_sertifikasi === 'BNSP').length;

    // Form state untuk add/edit
    // Inline edit form removed

    // Filter data berdasarkan search
    const paginatedData = sertifikasi; // server paginated

    // Handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    };

    const handleEditSertifikasi = (sertifikasi: SertifikasiView) => {
        window.location.href = `/admin/form-sertifikasi/${sertifikasi.id}`;
    };

    const handleViewSertifikasi = (sertifikasi: SertifikasiView) => {
        // Navigasi ke halaman detail sertifikasi
        router.visit(`/admin/detail-sertifikasi/${sertifikasi.id}`);
    };

    const handleDeleteSertifikasi = (sertifikasi: SertifikasiView) => {
        setSelectedSertifikasi(sertifikasi);
        setIsDeleteModalOpen(true);
    };

    // Removed handleSave (inline edit modal deleted)

    const handleDelete = async () => {
        if (!selectedSertifikasi) return;
        setActionLoading(true);
        try {
            await sertifikasiService.deleteSertifikasi(selectedSertifikasi.id);
            setSertifikasi(prev => prev.filter(s => s.id !== selectedSertifikasi.id));
            setIsDeleteModalOpen(false);
            setSelectedSertifikasi(null);
            toast({ type: 'success', title: 'Dihapus', message: 'Sertifikasi berhasil dihapus' });
        } catch (e: any) {
            setError(e.message || 'Gagal menghapus sertifikasi');
            toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal menghapus sertifikasi' });
        } finally { setActionLoading(false); }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sertifikasi Kompetensi" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sertifikasi Kompetensi</h1>
                        <p className="text-muted-foreground font-serif">Kelola program sertifikasi kompetensi</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild className="flex items-center gap-2">
                            <Link href="/admin/form-sertifikasi">
                                <Plus className="h-4 w-4" />
                                Tambah Sertifikasi
                            </Link>
                        </Button>
                    </div>
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
                                    <div className="text-2xl font-bold">{totalSertifikasi}</div>
                                    <p className="text-sm text-muted-foreground">Total Sertifikasi</p>
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
                                    <div className="text-2xl font-bold">{sertifikasiAktif}</div>
                                    <p className="text-sm text-muted-foreground">Sertifikasi Aktif</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{sertifikasiIndustri}</div>
                                    <p className="text-sm text-muted-foreground">Sertifikasi Industri</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{sertifikasiBNSP}</div>
                                    <p className="text-sm text-muted-foreground">Sertifikasi BNSP</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Sertifikasi</CardTitle>
                            <div className="flex items-center gap-2">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Cari sertifikasi..."
                                    className="w-56"
                                />
                                <Select value={jenisFilter} onValueChange={setJenisFilter}>
                                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Jenis" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua Jenis</SelectItem>
                                        <SelectItem value="BNSP">BNSP</SelectItem>
                                        <SelectItem value="Industri">Industri</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua Status</SelectItem>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                {error}
                            </div>
                        )}
                        {loading && (<ListSkeleton className="mb-4" rows={5} />)}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Thumbnail</TableHead>
                                    <TableHead>Nama Sertifikasi</TableHead>
                                    <TableHead>Jenis Sertifikasi</TableHead>
                                    <TableHead>Asesor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!loading && paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.thumbnail_url ? (
                                                    <img src={item.thumbnail_url} alt={item.nama_sertifikasi} className="h-12 w-16 rounded object-cover border" />
                                                ) : (
                                                    <div className="h-12 w-16 bg-gray-100 border rounded flex flex-col items-center justify-center text-[10px] text-gray-400">
                                                        <ImageOff className="h-4 w-4 mb-0.5" />
                                                        Kosong
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.nama_sertifikasi}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.jenis_sertifikasi === 'BNSP' ? 'default' : 'secondary'}>
                                                    {item.jenis_sertifikasi}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.nama_asesor}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(item.status)}>
                                                    {getStatusLabel(item.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewSertifikasi(item)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Lihat
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditSertifikasi(item)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteSertifikasi(item)}
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
                                        <TableCell colSpan={6} className="py-10">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <ImageOff className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-sm">
                                                    {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada sertifikasi.'}
                                                </p>
                                                {!searchQuery && (
                                                    <Button size="sm" onClick={() => router.visit('/admin/form-sertifikasi')}>
                                                        <Plus className="h-4 w-4 mr-1" /> Buat Sertifikasi
                                                    </Button>
                                                )}
                                            </div>
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
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    )}
                </Card>

                {/* Removed inline Edit Modal */}

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Apakah Anda yakin ingin menghapus sertifikasi <strong>{selectedSertifikasi?.nama_sertifikasi}</strong>?</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                                {actionLoading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Menghapus...</span> : 'Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
