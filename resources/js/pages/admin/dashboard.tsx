import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, FileText, Video, Award, Briefcase, Users, Eye, Loader2, TrendingUp, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { adminDashboardService, type DashboardData, type RecentRegistration, type PendingApplication, type ApplicationsInboxData } from '@/services/adminDashboardService';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    // State untuk data dashboard dari backend
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Selected item (extended with derived fields when opened)
    const [selectedApplication, setSelectedApplication] = useState<(RecentRegistration & { type?: 'sertifikasi' | 'pkl'; programName?: string }) | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load dashboard data dari backend
    useEffect(() => {
        // If no bearer token stored, redirect to login (avoid server-side session redirect loop)
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
    loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminDashboardService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationAction = async (action: 'approved' | 'rejected') => {
        if (!selectedApplication) return;

        try {
            setIsSubmitting(true);
            // TODO: Implement update status endpoint integration (sertifikasi / pkl) berdasarkan tipe
            // Placeholder: log action
            console.log('ACTION', action, 'for id', selectedApplication.id, 'reason', rejectionReason);
            
            // Reload data
            await loadDashboardData();
            
            // Close modal dan reset state
            setIsDetailModalOpen(false);
            setSelectedApplication(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Error updating application status:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDetailModal = (application: RecentRegistration & { type?: 'sertifikasi' | 'pkl'; programName?: string }) => {
        setSelectedApplication(application);
        setIsDetailModalOpen(true);
        setRejectionReason('');
    };

    // Helper function untuk format status
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'Pengajuan': 'bg-yellow-100 text-yellow-800',
            'Pending': 'bg-yellow-100 text-yellow-800', // fallback if backend uses English
            'Disetujui': 'bg-green-100 text-green-800', 
            'Ditolak': 'bg-red-100 text-red-800',
            'Dibatalkan': 'bg-gray-100 text-gray-800'
        } as const;
        return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
    };

    // Helper function untuk format tanggal
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Admin" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Memuat data dashboard...</span>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Derive combined pending applications from recent activities
    const combinedPending: Array<RecentRegistration & { type: 'sertifikasi' | 'pkl'; programName: string }> = [];
    if (dashboardData) {
        dashboardData.recent_activities.sertifikasi_registrations.forEach(r => {
            const status = r.status;
            if (['Pengajuan', 'Pending'].includes(status)) {
                combinedPending.push({
                    ...r,
                    type: 'sertifikasi',
                    programName: r.batch_sertifikasi?.sertifikasi.nama_sertifikasi || 'Sertifikasi'
                });
            }
        });
        dashboardData.recent_activities.pkl_applications.forEach(r => {
            const status = r.status;
            if (['Pengajuan', 'Pending'].includes(status)) {
                combinedPending.push({
                    ...r,
                    type: 'pkl',
                    programName: r.posisi_pkl?.nama_posisi || 'PKL'
                });
            }
        });
    }
    const today = new Date().toLocaleDateString('id-ID');
    const approvedToday = (dashboardData?.recent_activities.sertifikasi_registrations || []).filter(r => r.status === 'Disetujui' && new Date(r.created_at).toLocaleDateString('id-ID') === today).length
        + (dashboardData?.recent_activities.pkl_applications || []).filter(r => r.status === 'Disetujui' && new Date(r.created_at).toLocaleDateString('id-ID') === today).length;
    const rejectedToday = (dashboardData?.recent_activities.sertifikasi_registrations || []).filter(r => r.status === 'Ditolak' && new Date(r.created_at).toLocaleDateString('id-ID') === today).length
        + (dashboardData?.recent_activities.pkl_applications || []).filter(r => r.status === 'Ditolak' && new Date(r.created_at).toLocaleDateString('id-ID') === today).length;

    const stats = dashboardData?.statistics;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
                        <p className="text-muted-foreground">
                            Kelola semua konten dan data platform
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                        {error} – coba <button onClick={loadDashboardData} className="underline">muat ulang</button>
                    </div>
                )}
                {!error && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                            <Card className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats?.total_blogs || 0}</div>
                                            <p className="text-sm text-muted-foreground">Total Blog</p>
                                            <p className="text-xs text-green-600">Published</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Video className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats?.total_videos || 0}</div>
                                            <p className="text-sm text-muted-foreground">Total Video</p>
                                            <p className="text-xs text-green-600">Published</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Award className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats?.total_sertifikasi || 0}</div>
                                            <p className="text-sm text-muted-foreground">Sertifikasi</p>
                                            <p className="text-xs text-green-600">{stats?.total_batch_aktif || 0} Batch Aktif</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats?.total_posisi_pkl || 0}</div>
                                            <p className="text-sm text-muted-foreground">Posisi PKL</p>
                                            <p className="text-xs text-green-600">Aktif</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                                            <p className="text-sm text-muted-foreground">Total Users</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Award className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats?.total_pendaftar_sertifikasi || 0}</div>
                                            <p className="text-sm text-muted-foreground">Pendaftar Sertifikasi</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-teal-100 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stats?.total_pendaftar_pkl || 0}</div>
                                            <p className="text-sm text-muted-foreground">Pendaftar PKL</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    <Link href="/admin/manajemen-blog">
                                        <Button variant="outline" className="w-full justify-start">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Manajemen Blog
                                        </Button>
                                    </Link>
                                    <Link href="/admin/manajemen-video">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Video className="mr-2 h-4 w-4" />
                                            Manajemen Video
                                        </Button>
                                    </Link>
                                    <Link href="/admin/manajemen-sertifikasi">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Award className="mr-2 h-4 w-4" />
                                            Manajemen Sertifikasi
                                        </Button>
                                    </Link>
                                    <Link href="/admin/manajemen-pkl">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Briefcase className="mr-2 h-4 w-4" />
                                            Manajemen PKL
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Pengajuan Pendaftaran Terbaru
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {dashboardData?.recent_activities.sertifikasi_registrations?.slice(0, 5).map((registration: RecentRegistration) => (
                                            <div key={`sertifikasi-${registration.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                                <div className="p-1 bg-yellow-100 rounded">
                                                    <Award className="h-3 w-3 text-yellow-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {registration.user.name} - {registration.batch_sertifikasi?.sertifikasi.nama_sertifikasi}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(registration.tanggal_pendaftaran)}
                                                        </p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(registration.status)}`}>
                                                            {registration.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {dashboardData?.recent_activities.pkl_applications?.slice(0, 3).map((application: RecentRegistration) => (
                                            <div key={`pkl-${application.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                                <div className="p-1 bg-green-100 rounded">
                                                    <Briefcase className="h-3 w-3 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {application.user.name} - {application.posisi_pkl?.nama_posisi}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(application.tanggal_pendaftaran)}
                                                        </p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(application.status)}`}>
                                                            {application.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {(!dashboardData?.recent_activities.sertifikasi_registrations?.length && !dashboardData?.recent_activities.pkl_applications?.length) && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Belum ada pendaftaran terbaru
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pengajuan Pendaftaran (derived) */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Pengajuan Pendaftaran
                                        <Badge variant="secondary" className="ml-2">
                                            {combinedPending.length} Pending
                                        </Badge>
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="text-green-600">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {approvedToday} Disetujui Hari Ini
                                        </Badge>
                                        <Badge variant="outline" className="text-red-600">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            {rejectedToday} Ditolak Hari Ini
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Kotak masuk untuk semua aplikasi baru dari pengguna yang memerlukan persetujuan admin
                                </p>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">No</TableHead>
                                                <TableHead>Nama Pendaftar</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Jenis Program</TableHead>
                                                <TableHead>Program/Posisi</TableHead>
                                                <TableHead>Tanggal Daftar</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {combinedPending.map((application, index) => (
                                                <TableRow key={`pending-${application.type}-${application.id}`} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{application.user.name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{application.user.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={(application as any).type === 'sertifikasi' ? 'default' : 'secondary'}>
                                                            {(application as any).type === 'sertifikasi' ? 'Sertifikasi' : 'PKL'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        {(application as any).programName}
                                                    </TableCell>
                                                    <TableCell>{formatDate(application.tanggal_pendaftaran)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-yellow-500" />
                                                            <span className="text-sm text-yellow-600 font-medium">Pengajuan</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => openDetailModal(application)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Detail
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            
                                            {combinedPending.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <CheckCircle className="h-8 w-8 text-green-500" />
                                                            <p>Tidak ada pengajuan pending yang memerlukan persetujuan</p>
                                                            <p className="text-sm">Semua aplikasi telah diproses</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                            </CardContent>
                        </Card>

                        {/* Application Detail Modal */}
                        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Detail Pengajuan Pendaftaran</DialogTitle>
                                    <DialogDescription>
                                        Review lengkap data pendaftar dan berikan keputusan persetujuan
                                    </DialogDescription>
                                </DialogHeader>
                                
                                {selectedApplication && (
                                    <div className="space-y-6">
                                        {/* Informasi Pendaftar */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Nama Pendaftar</label>
                                                <p className="text-sm font-semibold">{selectedApplication.user.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                                <p className="text-sm">{selectedApplication.user.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Jenis Program</label>
                                                <Badge variant={selectedApplication.type === 'sertifikasi' ? 'default' : 'secondary'}>
                                                    {selectedApplication.type === 'sertifikasi' ? 'Sertifikasi Kompetensi' : 'Praktik Kerja Lapangan'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Tanggal Pendaftaran</label>
                                                <p className="text-sm">{formatDate(selectedApplication.tanggal_pendaftaran)}</p>
                                            </div>
                                        </div>

                                        {/* Program Details */}
                                        <div className="border rounded-lg p-4 bg-muted/30">
                                            <h4 className="font-semibold mb-2">Informasi Program</h4>
                                            {selectedApplication.type === 'sertifikasi' && selectedApplication.batch_sertifikasi && (
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">Nama Sertifikasi</label>
                                                        <p className="text-sm">{selectedApplication.batch_sertifikasi.sertifikasi.nama_sertifikasi}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">Batch</label>
                                                        <p className="text-sm">{selectedApplication.batch_sertifikasi.nama_batch}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedApplication.type === 'pkl' && selectedApplication.posisi_pkl && (
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">Posisi PKL</label>
                                                    <p className="text-sm">{selectedApplication.posisi_pkl.nama_posisi}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Placeholder status dokumen (karena belum ada detail di data recent) */}
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                                            <span>Detail kelengkapan dokumen tidak tersedia di data ringkas.</span>
                                        </div>

                                        {/* Rejection Reason Input */}
                                        <div>
                                            <label htmlFor="rejection-reason" className="text-sm font-medium text-muted-foreground">
                                                Alasan Penolakan (wajib diisi jika menolak)
                                            </label>
                                            <Textarea
                                                id="rejection-reason"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Masukkan alasan jika Anda akan menolak pengajuan ini..."
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}

                                <DialogFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDetailModalOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleApplicationAction('rejected')}
                                        disabled={isSubmitting || !rejectionReason.trim()}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Tolak
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => handleApplicationAction('approved')}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Setujui
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
