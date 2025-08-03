import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import DetailPendaftaranModal from '@/components/DetailPendaftaranModal';
import FilterDropdown from '@/components/FilterDropdown';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface BiodataPeserta {
    nama: string;
    tempatTanggalLahir: string;
    alamat: string;
    email: string;
    noTelepon: string;
}

interface SertifikasiKompetensi {
    namaSertifikasi: string;
    jadwalSertifikasi: string;
    batch: string;
    assessor: string;
}

interface PendaftaranData {
    id: number;
    nama: string;
    jenisPendaftaran: string;
    tanggalPendaftaran: string;
    status: 'Pengajuan' | 'Disetujui' | 'Ditolak';
    statusColor: string;
    biodata: BiodataPeserta;
    sertifikasi: SertifikasiKompetensi;
}

// Interface untuk active filters
interface ActiveFilters {
    jenisPendaftaran: string[];
    tanggalPendaftaran: {
        startDate: string;
        endDate: string;
    } | null;
    status: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const [selectedPendaftar, setSelectedPendaftar] = useState<PendaftaranData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        jenisPendaftaran: [],
        tanggalPendaftaran: null,
        status: [],
    });

    const pendaftaranData = [
        {
            id: 1,
            nama: 'Joseph',
            jenisPendaftaran: 'Sertifikasi Kompetensi',
            tanggalPendaftaran: '21-05-2025',
            status: 'Pengajuan' as const,
            statusColor: 'bg-blue-100 text-blue-800',
            biodata: {
                nama: 'Joseph Anderson',
                tempatTanggalLahir: 'Jakarta, 15 Januari 1995',
                alamat: 'Jl. Merdeka No. 123, Jakarta Selatan',
                email: 'joseph.anderson@email.com',
                noTelepon: '081234567890'
            },
            sertifikasi: {
                namaSertifikasi: 'Teknisi Jaringan Komputer',
                jadwalSertifikasi: '28 Juli 2025',
                batch: 'Batch 2025-01',
                assessor: 'Dr. Ahmad Wijaya'
            }
        },
        {
            id: 2,
            nama: 'Sterling',
            jenisPendaftaran: 'Praktik Kerja Lapangan',
            tanggalPendaftaran: '22-05-2025',
            status: 'Ditolak' as const,
            statusColor: 'bg-red-100 text-red-800',
            biodata: {
                nama: 'Sterling Cooper',
                tempatTanggalLahir: 'Bandung, 20 Maret 1996',
                alamat: 'Jl. Asia Afrika No. 45, Bandung',
                email: 'sterling.cooper@email.com',
                noTelepon: '081234567891'
            },
            sertifikasi: {
                namaSertifikasi: 'Praktik Kerja Lapangan IT',
                jadwalSertifikasi: '30 Juli 2025',
                batch: 'PKL 2025-02',
                assessor: 'Prof. Siti Nurhaliza'
            }
        },
        {
            id: 3,
            nama: 'Ahmad',
            jenisPendaftaran: 'Sertifikasi Kompetensi',
            tanggalPendaftaran: '22-05-2025',
            status: 'Disetujui' as const,
            statusColor: 'bg-green-100 text-green-800',
            biodata: {
                nama: 'Ahmad Rizki',
                tempatTanggalLahir: 'Surabaya, 10 Februari 1994',
                alamat: 'Jl. Pemuda No. 78, Surabaya',
                email: 'ahmad.rizki@email.com',
                noTelepon: '081234567892'
            },
            sertifikasi: {
                namaSertifikasi: 'Web Developer',
                jadwalSertifikasi: '01 Agustus 2025',
                batch: 'Batch 2025-03',
                assessor: 'Ir. Budi Santoso'
            }
        },
        {
            id: 4,
            nama: 'Jajang',
            jenisPendaftaran: 'Sertifikasi Kompetensi',
            tanggalPendaftaran: '22-05-2025',
            status: 'Pengajuan' as const,
            statusColor: 'bg-blue-100 text-blue-800',
            biodata: {
                nama: 'Jajang Sutrisno',
                tempatTanggalLahir: 'Yogyakarta, 25 Juni 1993',
                alamat: 'Jl. Malioboro No. 12, Yogyakarta',
                email: 'jajang.sutrisno@email.com',
                noTelepon: '081234567893'
            },
            sertifikasi: {
                namaSertifikasi: 'Database Administrator',
                jadwalSertifikasi: '03 Agustus 2025',
                batch: 'Batch 2025-04',
                assessor: 'Dr. Rina Sari'
            }
        },
        {
            id: 5,
            nama: 'Siti',
            jenisPendaftaran: 'Praktik Kerja Lapangan',
            tanggalPendaftaran: '22-05-2025',
            status: 'Disetujui' as const,
            statusColor: 'bg-green-100 text-green-800',
            biodata: {
                nama: 'Siti Aminah',
                tempatTanggalLahir: 'Medan, 08 September 1997',
                alamat: 'Jl. Gatot Subroto No. 56, Medan',
                email: 'siti.aminah@email.com',
                noTelepon: '081234567894'
            },
            sertifikasi: {
                namaSertifikasi: 'Praktik Kerja Lapangan Multimedia',
                jadwalSertifikasi: '05 Agustus 2025',
                batch: 'PKL 2025-05',
                assessor: 'M. Sc. Fitri Handayani'
            }
        },
    ];

    // Function untuk filter data berdasarkan search dan filters
    const filteredData = pendaftaranData.filter((item) => {
        // Filter berdasarkan search query
        const matchesSearch = searchQuery === '' || 
            item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.jenisPendaftaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sertifikasi.namaSertifikasi.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter berdasarkan jenis pendaftaran
        const matchesJenisPendaftaran = activeFilters.jenisPendaftaran.length === 0 ||
            activeFilters.jenisPendaftaran.includes(item.jenisPendaftaran);

        // Filter berdasarkan status
        const matchesStatus = activeFilters.status.length === 0 ||
            activeFilters.status.includes(item.status);

        // Filter berdasarkan tanggal pendaftaran
        const matchesTanggal = !activeFilters.tanggalPendaftaran ||
            (() => {
                const itemDate = new Date(item.tanggalPendaftaran.split('-').reverse().join('-')); // Convert DD-MM-YYYY to YYYY-MM-DD
                const startDate = activeFilters.tanggalPendaftaran.startDate ? 
                    new Date(activeFilters.tanggalPendaftaran.startDate) : null;
                const endDate = activeFilters.tanggalPendaftaran.endDate ? 
                    new Date(activeFilters.tanggalPendaftaran.endDate) : null;

                if (startDate && endDate) {
                    return itemDate >= startDate && itemDate <= endDate;
                } else if (startDate) {
                    return itemDate >= startDate;
                } else if (endDate) {
                    return itemDate <= endDate;
                }
                return true;
            })();

        return matchesSearch && matchesJenisPendaftaran && matchesStatus && matchesTanggal;
    });

    // Calculate pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Handle pagination changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1); // Reset ke halaman pertama saat mengubah items per page
    };

    const handleDetailClick = (pendaftar: PendaftaranData) => {
        setSelectedPendaftar(pendaftar);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedPendaftar(null);
    };

    const handleApproval = (status: 'Disetujui' | 'Ditolak', alasan?: string) => {
        if (status === 'Disetujui') {
            // Logic untuk menyetujui pendaftaran
            console.log('Pendaftaran disetujui:', selectedPendaftar);
        } else if (status === 'Ditolak') {
            // Logic untuk menolak pendaftaran
            console.log('Pendaftaran ditolak:', selectedPendaftar, 'Alasan:', alasan);
        }
        
        // Reset state
        handleModalClose();
    };    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                                Peserta Sertifikasi
                            </CardTitle>
                            <div className="text-2xl font-bold">120</div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                                Siswa PKL
                            </CardTitle>
                            <div className="text-2xl font-bold">120</div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                                Assessor
                            </CardTitle>
                            <div className="text-2xl font-bold">120</div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                                Jumlah Sertifikasi
                            </CardTitle>
                            <div className="text-2xl font-bold">120</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pengajuan Pendaftaran Section */}
                <Card className="flex-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-semibold">Pengajuan Pendaftaran</CardTitle>
                            <div className="flex items-center gap-2">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Cari nama peserta atau program..."
                                    className="w-64"
                                />
                                <FilterDropdown
                                    activeFilters={activeFilters}
                                    onFiltersChange={setActiveFilters}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">No</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Jenis Pendaftaran</TableHead>
                                    <TableHead>Tanggal Pendaftaran</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.nama}</TableCell>
                                            <TableCell>{item.jenisPendaftaran}</TableCell>
                                            <TableCell>{item.tanggalPendaftaran}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.statusColor}`}>
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleDetailClick(item)}
                                                >
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {searchQuery || activeFilters.jenisPendaftaran.length > 0 || activeFilters.status.length > 0 || activeFilters.tanggalPendaftaran
                                                ? 'Tidak ada data yang sesuai dengan filter atau pencarian'
                                                : 'Tidak ada data pendaftaran'
                                            }
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    
                    {/* Pagination Component - Di bawah tabel */}
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

                {/* Modal Detail Pendaftaran */}
                {selectedPendaftar && (
                    <DetailPendaftaranModal
                        isOpen={isModalOpen}
                        pendaftarData={selectedPendaftar}
                        onClose={handleModalClose}
                        onApproval={handleApproval}
                    />
                )}
            </div>
        </AppLayout>
    );
}
