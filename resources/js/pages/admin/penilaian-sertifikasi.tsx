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
    Users, 
    Clock, 
    CheckCircle, 
    Eye, 
    MoreVertical,
    AlertCircle,
    Award,
    FileCheck
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';

interface SertifikasiData {
    id: number;
    namaSertifikasi: string;
    assessor: string;
    penyelenggara: string;
}

interface BatchData {
    id: number;
    namaBatch: string;
    jumlahPeserta: number;
    status: 'Aktif' | 'Selesai' | 'Akan Datang';
}

// Mock data - replace with actual data from backend
const mockSertifikasiData: SertifikasiData[] = [
    {
        id: 1,
        namaSertifikasi: 'Digital Marketing',
        assessor: 'Jajang Maman',
        penyelenggara: 'Industri'
    },
    {
        id: 2,
        namaSertifikasi: 'Human Resources Management',
        assessor: 'Dr. Sari Kusuma',
        penyelenggara: 'BNSP'
    },
    {
        id: 3,
        namaSertifikasi: 'Web Developer Professional',
        assessor: 'Ir. Budi Santoso',
        penyelenggara: 'Industri'
    },
    {
        id: 4,
        namaSertifikasi: 'Financial Management',
        assessor: 'Prof. Indah Permata',
        penyelenggara: 'BNSP'
    }
];

const mockBatchData: { [sertifikasiId: number]: BatchData[] } = {
    1: [
        { id: 1, namaBatch: 'Batch 1', jumlahPeserta: 212, status: 'Aktif' },
        { id: 2, namaBatch: 'Batch 2', jumlahPeserta: 180, status: 'Selesai' },
        { id: 3, namaBatch: 'Batch 3', jumlahPeserta: 95, status: 'Akan Datang' }
    ],
    2: [
        { id: 4, namaBatch: 'Batch 1', jumlahPeserta: 156, status: 'Aktif' },
        { id: 5, namaBatch: 'Batch 2', jumlahPeserta: 89, status: 'Selesai' }
    ],
    3: [
        { id: 6, namaBatch: 'Batch 1', jumlahPeserta: 203, status: 'Aktif' },
        { id: 7, namaBatch: 'Batch 2', jumlahPeserta: 167, status: 'Selesai' },
        { id: 8, namaBatch: 'Batch 3', jumlahPeserta: 134, status: 'Akan Datang' }
    ],
    4: [
        { id: 9, namaBatch: 'Batch 1', jumlahPeserta: 78, status: 'Aktif' }
    ]
};

export default function PenilaianSertifikasi() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedSertifikasi, setSelectedSertifikasi] = useState<SertifikasiData | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Penilaian', href: '#' },
        { title: 'Sertifikasi', href: '/admin/penilaian-sertifikasi' }
    ];

    // Filter and pagination logic untuk sertifikasi
    const filteredSertifikasi = useMemo(() => {
        return mockSertifikasiData.filter(sertifikasi =>
            sertifikasi.namaSertifikasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sertifikasi.assessor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sertifikasi.penyelenggara.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const totalItems = filteredSertifikasi.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSertifikasi = filteredSertifikasi.slice(startIndex, startIndex + itemsPerPage);

    // Get batch data for selected sertifikasi
    const selectedBatchData = selectedSertifikasi ? mockBatchData[selectedSertifikasi.id] || [] : [];

    // Statistics calculations
    const totalSertifikasi = mockSertifikasiData.length;
    const totalBatch = Object.values(mockBatchData).flat().length;
    const aktiveBatch = Object.values(mockBatchData).flat().filter(b => b.status === 'Aktif').length;
    const totalPeserta = Object.values(mockBatchData).flat().reduce((sum, batch) => sum + batch.jumlahPeserta, 0);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    };

    const handleSertifikasiClick = (sertifikasi: SertifikasiData) => {
        setSelectedSertifikasi(sertifikasi);
    };

    const handleBatchClick = (batch: BatchData) => {
        // Navigate to batch detail page
        if (selectedSertifikasi) {
            window.location.href = `/admin/penilaian-sertifikasi/${selectedSertifikasi.id}/batch/${batch.id}`;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Aktif': return 'default';
            case 'Selesai': return 'secondary';
            case 'Akan Datang': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penilaian Sertifikasi Kompetensi" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Penilaian Sertifikasi Kompetensi</h1>
                        <p className="text-muted-foreground font-serif">Kelola penilaian peserta sertifikasi kompetensi</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Award className="h-5 w-5 text-blue-600" />
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
                                    <FileCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalBatch}</div>
                                    <p className="text-sm text-muted-foreground">Total Batch</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{aktiveBatch}</div>
                                    <p className="text-sm text-muted-foreground">Batch Aktif</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Users className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalPeserta}</div>
                                    <p className="text-sm text-muted-foreground">Total Peserta</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Two Tables Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Table - Sertifikasi Kompetensi */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Sertifikasi Kompetensi</CardTitle>
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Cari sertifikasi..."
                                    className="w-48"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Nama Sertifikasi</TableHead>
                                        <TableHead>Assessor</TableHead>
                                        <TableHead>Penyelenggara</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedSertifikasi.length > 0 ? (
                                        paginatedSertifikasi.map((sertifikasi, index) => (
                                            <TableRow 
                                                key={sertifikasi.id}
                                                className={`cursor-pointer hover:bg-muted/50 ${
                                                    selectedSertifikasi?.id === sertifikasi.id ? 'bg-muted' : ''
                                                }`}
                                                onClick={() => handleSertifikasiClick(sertifikasi)}
                                            >
                                                <TableCell className="font-medium">
                                                    {startIndex + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {sertifikasi.namaSertifikasi}
                                                </TableCell>
                                                <TableCell>{sertifikasi.assessor}</TableCell>
                                                <TableCell>
                                                    <Badge variant={sertifikasi.penyelenggara === 'BNSP' ? 'default' : 'secondary'}>
                                                        {sertifikasi.penyelenggara}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                {searchQuery
                                                    ? 'Tidak ada data yang sesuai dengan pencarian'
                                                    : 'Tidak ada data sertifikasi'
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

                    {/* Right Table - Batch */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedSertifikasi ? `Batch` : 'Pilih Sertifikasi'}
                            </CardTitle>
                            {selectedSertifikasi && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedSertifikasi.namaSertifikasi}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            {selectedSertifikasi ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No</TableHead>
                                            <TableHead>Nama Batch</TableHead>
                                            <TableHead>Jumlah Peserta</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedBatchData.length > 0 ? (
                                            selectedBatchData.map((batch, index) => (
                                                <TableRow key={batch.id} className="cursor-pointer hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {batch.namaBatch}
                                                    </TableCell>
                                                    <TableCell>{batch.jumlahPeserta}</TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleBatchClick(batch)}
                                                        >
                                                            Lihat & Nilai
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    Tidak ada batch untuk sertifikasi ini
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex items-center justify-center py-20 text-muted-foreground">
                                    <div className="text-center">
                                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Pilih Sertifikasi</p>
                                        <p className="text-sm">Klik pada sertifikasi di sebelah kiri untuk melihat daftar batch</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
