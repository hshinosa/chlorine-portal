import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { 
    Eye, 
    MoreVertical,
    Award,
    ArrowLeft
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';

interface PesertaBatch {
    id: number;
    nama: string;
    email: string;
    statusTugasAkhir: 'Sudah Mengumpulkan' | 'Belum Mengumpulkan';
    statusPenilaian: 'Belum Dinilai' | 'Lulus' | 'Tidak Lulus';
}

interface BatchInfo {
    id: number;
    namaBatch: string;
    namaSertifikasi: string;
    assessor: string;
    penyelenggara: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    status: 'Aktif' | 'Selesai' | 'Akan Datang';
    totalPeserta: number;
}

// Mock data peserta dalam batch
const mockPesertaBatch: PesertaBatch[] = [
    {
        id: 1,
        nama: 'Muhammad Hashfi Hadyan',
        email: 'hashfi@company.com',
        statusTugasAkhir: 'Sudah Mengumpulkan',
        statusPenilaian: 'Belum Dinilai'
    },
    {
        id: 2,
        nama: 'Siti Nurhaliza',
        email: 'siti@company.com',
        statusTugasAkhir: 'Belum Mengumpulkan',
        statusPenilaian: 'Belum Dinilai'
    },
    {
        id: 3,
        nama: 'Ahmad Rizki',
        email: 'rizki@webdev.com',
        statusTugasAkhir: 'Sudah Mengumpulkan',
        statusPenilaian: 'Lulus'
    },
    {
        id: 4,
        nama: 'Dewi Sartika',
        email: 'dewi@finance.com',
        statusTugasAkhir: 'Sudah Mengumpulkan',
        statusPenilaian: 'Tidak Lulus'
    },
    {
        id: 5,
        nama: 'Joko Widodo',
        email: 'joko@manufacturing.com',
        statusTugasAkhir: 'Belum Mengumpulkan',
        statusPenilaian: 'Belum Dinilai'
    }
];

// Mock data informasi batch
const mockBatchInfo: BatchInfo = {
    id: 1,
    namaBatch: 'Batch 1',
    namaSertifikasi: 'Digital Marketing',
    assessor: 'Jajang Maman',
    penyelenggara: 'Industri',
    tanggalMulai: '21-05-2025',
    tanggalSelesai: '21-08-2025',
    status: 'Aktif',
    totalPeserta: 212
};

export default function BatchPenilaianSertifikasi() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedPeserta, setSelectedPeserta] = useState<PesertaBatch | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusPenilaian, setStatusPenilaian] = useState<'Lulus' | 'Tidak Lulus' | ''>('');
    const [keterangan, setKeterangan] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Penilaian', href: '#' },
        { title: 'Sertifikasi', href: '/admin/penilaian-sertifikasi' },
        { title: mockBatchInfo.namaBatch, href: '#' }
    ];

    // Filter and pagination logic
    const filteredData = useMemo(() => {
        return mockPesertaBatch.filter(peserta =>
            peserta.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            peserta.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Statistics calculations (removed unused variables)
    // Note: totalPeserta, belumDinilai, lulus, tidakLulus variables removed as they're not displayed in UI

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    };

    const handleViewDetail = (peserta: PesertaBatch) => {
        setSelectedPeserta(peserta);
        setStatusPenilaian(peserta.statusPenilaian === 'Belum Dinilai' ? '' : peserta.statusPenilaian);
        setKeterangan('');
        setIsModalOpen(true);
    };

    const handleSavePenilaian = () => {
        if (selectedPeserta && statusPenilaian) {
            // Update peserta status in the data
            const updatedData = mockPesertaBatch.map(p => 
                p.id === selectedPeserta.id 
                    ? { ...p, statusPenilaian: statusPenilaian }
                    : p
            );
            // In real app, you would update the backend here
            console.log('Saving assessment:', { peserta: selectedPeserta, status: statusPenilaian, keterangan });
            setIsModalOpen(false);
            setSelectedPeserta(null);
            setStatusPenilaian('');
            setKeterangan('');
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Lulus': return 'default';
            case 'Tidak Lulus': return 'destructive';
            case 'Belum Dinilai': return 'outline';
            default: return 'outline';
        }
    };

    const getTugasAkhirBadgeVariant = (status: string) => {
        switch (status) {
            case 'Sudah Mengumpulkan': return 'default';
            case 'Belum Mengumpulkan': return 'outline';
            default: return 'outline';
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getBatchStatusColor = (status: string) => {
        switch (status) {
            case 'Aktif': return 'bg-green-100 text-green-800';
            case 'Selesai': return 'bg-gray-100 text-gray-800';
            case 'Akan Datang': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${mockBatchInfo.namaSertifikasi} - ${mockBatchInfo.namaBatch}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header dengan tombol kembali */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/penilaian-sertifikasi" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {mockBatchInfo.namaSertifikasi} - {mockBatchInfo.namaBatch}
                        </h1>
                        <p className="text-muted-foreground font-serif">
                            Kelola penilaian peserta dalam batch ini
                        </p>
                    </div>
                </div>

                {/* Batch Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Informasi Batch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Assessor</p>
                                <p className="font-medium">{mockBatchInfo.assessor}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Penyelenggara</p>
                                <Badge className={mockBatchInfo.penyelenggara === 'BNSP' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                    {mockBatchInfo.penyelenggara}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status Batch</p>
                                <Badge className={getBatchStatusColor(mockBatchInfo.status)}>
                                    {mockBatchInfo.status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Periode</p>
                                <p className="font-medium">{mockBatchInfo.tanggalMulai} - {mockBatchInfo.tanggalSelesai}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Peserta</p>
                                <p className="font-medium">{mockBatchInfo.totalPeserta} peserta</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Peserta</CardTitle>
                            <div className="flex items-center gap-2">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Cari peserta..."
                                    className="w-64"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Peserta</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status Tugas Akhir</TableHead>
                                    <TableHead>Status Penilaian</TableHead>
                                    <TableHead className="w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((peserta) => (
                                        <TableRow key={peserta.id}>
                                            <TableCell>
                                                <div className="font-medium">{peserta.nama}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{peserta.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getTugasAkhirBadgeVariant(peserta.statusTugasAkhir)}>
                                                    {peserta.statusTugasAkhir}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(peserta.statusPenilaian)}>
                                                    {peserta.statusPenilaian}
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
                                                        <DropdownMenuItem onClick={() => handleViewDetail(peserta)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Lihat Detail & Nilai
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            {searchQuery
                                                ? 'Tidak ada data yang sesuai dengan pencarian'
                                                : 'Tidak ada data peserta dalam batch ini'
                                            }
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="border-t">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                totalItems={totalItems}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    )}
                </Card>

                {/* Modal Penilaian */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                Submisi - {selectedPeserta?.nama}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                            {/* Submisi Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Submisi</h3>
                                <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                                    <p className="text-gray-500">File submisi akan ditampilkan di sini</p>
                                </div>
                            </div>

                            {/* Kelulusan Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Kelulusan</h3>
                                <div className="flex gap-4">
                                    <Button
                                        variant={statusPenilaian === 'Lulus' ? 'default' : 'outline'}
                                        onClick={() => setStatusPenilaian('Lulus')}
                                        className="flex-1"
                                    >
                                        Lulus
                                    </Button>
                                    <Button
                                        variant={statusPenilaian === 'Tidak Lulus' ? 'destructive' : 'outline'}
                                        onClick={() => setStatusPenilaian('Tidak Lulus')}
                                        className="flex-1"
                                    >
                                        Tidak Lulus
                                    </Button>
                                </div>
                            </div>

                            {/* Keterangan Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Keterangan</h3>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Tambahkan keterangan penilaian..."
                                    className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSavePenilaian}
                                    disabled={!statusPenilaian}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
