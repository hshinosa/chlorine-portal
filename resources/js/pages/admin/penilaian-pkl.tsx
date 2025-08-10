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
    AlertCircle
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';

interface PesertaPKL {
    id: number;
    nama: string;
    email: string;
    noTelepon: string;
    sekolahUniversitas: string;
    jurusan: string;
    posisiPKL: string;
    tingkat: string;
    statusPenilaian: 'Belum Dinilai' | 'Sedang Berjalan' | 'Lulus' | 'Tidak Lulus';
    submittedDocuments: number;
    totalDocuments: number;
    tanggalMulai: string;
    tanggalSelesai: string;
    pembimbing: string;
}

// Mock data - replace with actual data from backend
const mockPesertaPKL: PesertaPKL[] = [
    {
        id: 1,
        nama: 'Muhammad Hashfi Hadyan',
        email: 'hashfi@telkom.ac.id',
        noTelepon: '081234567890',
        sekolahUniversitas: 'Telkom University',
        jurusan: 'Teknik Informatika',
        posisiPKL: 'Frontend Developer',
        tingkat: 'Semester 6',
        statusPenilaian: 'Sedang Berjalan',
        submittedDocuments: 6,
        totalDocuments: 8,
        tanggalMulai: '21-05-2025',
        tanggalSelesai: '21-08-2025',
        pembimbing: 'Budi Santoso, S.Kom'
    },
    {
        id: 2,
        nama: 'Siti Nurhaliza',
        email: 'siti@telkom.ac.id',
        noTelepon: '081234567891',
        sekolahUniversitas: 'Telkom University',
        jurusan: 'Sistem Informasi',
        posisiPKL: 'UI/UX Designer',
        tingkat: 'Semester 6',
        statusPenilaian: 'Belum Dinilai',
        submittedDocuments: 4,
        totalDocuments: 8,
        tanggalMulai: '15-06-2025',
        tanggalSelesai: '15-09-2025',
        pembimbing: 'Andi Wijaya, S.Des'
    },
    {
        id: 3,
        nama: 'Ahmad Rizki',
        email: 'rizki@telkom.ac.id',
        noTelepon: '081234567892',
        sekolahUniversitas: 'Telkom University',
        jurusan: 'Teknik Komputer',
        posisiPKL: 'Backend Developer',
        tingkat: 'Semester 6',
        statusPenilaian: 'Lulus',
        submittedDocuments: 8,
        totalDocuments: 8,
        tanggalMulai: '01-05-2025',
        tanggalSelesai: '01-08-2025',
        pembimbing: 'Indra Kusuma, S.T'
    },
    {
        id: 4,
        nama: 'Dewi Sartika',
        email: 'dewi@smk-teknik.ac.id',
        noTelepon: '081234567893',
        sekolahUniversitas: 'SMK Teknik Informatika',
        jurusan: 'Teknik Komputer dan Jaringan',
        posisiPKL: 'Quality Assurance',
        tingkat: 'Kelas 12',
        statusPenilaian: 'Tidak Lulus',
        submittedDocuments: 5,
        totalDocuments: 8,
        tanggalMulai: '10-04-2025',
        tanggalSelesai: '10-07-2025',
        pembimbing: 'Sari Dewi, S.Kom'
    }
];

export default function PenilaianPKL() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Penilaian', href: '#' },
        { title: 'PKL', href: '/admin/penilaian-pkl' }
    ];

    // Filter and pagination logic
    const filteredData = useMemo(() => {
        return mockPesertaPKL.filter(peserta =>
            peserta.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            peserta.posisiPKL.toLowerCase().includes(searchQuery.toLowerCase()) ||
            peserta.tingkat.toLowerCase().includes(searchQuery.toLowerCase()) ||
            peserta.sekolahUniversitas.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Statistics calculations
    const totalPeserta = mockPesertaPKL.length;
    const sedangBerjalan = mockPesertaPKL.filter(p => p.statusPenilaian === 'Sedang Berjalan').length;
    const lulus = mockPesertaPKL.filter(p => p.statusPenilaian === 'Lulus').length;
    const belumDinilai = mockPesertaPKL.filter(p => p.statusPenilaian === 'Belum Dinilai').length;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    };

    const handleViewDetail = (peserta: PesertaPKL) => {
        // Navigate to detail page
        window.location.href = `/admin/penilaian-pkl/${peserta.id}`;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Lulus': return 'default';
            case 'Tidak Lulus': return 'destructive';
            case 'Sedang Berjalan': return 'secondary';
            case 'Belum Dinilai': return 'outline';
            default: return 'outline';
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penilaian PKL" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Penilaian PKL</h1>
                        <p className="text-muted-foreground font-serif">Kelola penilaian peserta Praktik Kerja Lapangan</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalPeserta}</div>
                                    <p className="text-sm text-muted-foreground">Total Peserta</p>
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
                                    <div className="text-2xl font-bold">{sedangBerjalan}</div>
                                    <p className="text-sm text-muted-foreground">Sedang Berjalan</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{lulus}</div>
                                    <p className="text-sm text-muted-foreground">Lulus</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{belumDinilai}</div>
                                    <p className="text-sm text-muted-foreground">Belum Dinilai</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Peserta PKL</CardTitle>
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
                                    <TableHead>Sekolah/Universitas</TableHead>
                                    <TableHead>Posisi PKL</TableHead>
                                    <TableHead>Tingkat</TableHead>
                                    <TableHead>Status Penilaian</TableHead>
                                    <TableHead className="w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((peserta) => (
                                        <TableRow key={peserta.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{peserta.nama}</div>
                                                    <div className="text-sm text-muted-foreground">{peserta.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{peserta.sekolahUniversitas}</div>
                                                    <div className="text-sm text-muted-foreground">{peserta.jurusan}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{peserta.posisiPKL}</TableCell>
                                            <TableCell>{peserta.tingkat}</TableCell>
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
                                                            Lihat Progress & Nilai
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {searchQuery
                                                ? 'Tidak ada data yang sesuai dengan pencarian'
                                                : 'Tidak ada data peserta PKL'
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
            </div>
        </AppLayout>
    );
}
