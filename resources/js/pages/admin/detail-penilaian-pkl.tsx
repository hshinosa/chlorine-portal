import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { 
    ArrowLeft,
    GraduationCap,
    Building,
    FileText,
    Download,
    CheckCircle,
    XCircle,
    Eye,
    ExternalLink,
    File
} from 'lucide-react';

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
    progressDocuments: number;
    submittedDocuments: number;
    totalDocuments: number;
    tanggalMulai: string;
    tanggalSelesai: string;
    pembimbing: string;
    periodePKL: string;
}

// Mock data - in real app, this would come from props or API
const mockPeserta: PesertaPKL = {
    id: 1,
    nama: 'Muhammad Hashfi Hadyan',
    email: 'hashfi@telkom.ac.id',
    noTelepon: '081234567890',
    sekolahUniversitas: 'Telkom University',
    jurusan: 'Teknik Informatika',
    posisiPKL: 'Frontend Developer',
    tingkat: 'Semester 6',
    statusPenilaian: 'Sedang Berjalan',
    progressDocuments: 75,
    submittedDocuments: 6,
    totalDocuments: 8,
    tanggalMulai: '01-06-2025',
    tanggalSelesai: '01-08-2025',
    pembimbing: 'Budi Santoso, S.Kom',
    periodePKL: '01-06-2025 - 01-08-2025'
};

interface WeeklyReport {
    id: number;
    submissionNumber: string;
    submittedDate?: string;
    status: 'submitted' | 'pending';
    jenisDocument: 'Laporan/Tugas' | '';
    submissionType: 'link' | 'document' | '';
    isAssessed: boolean;
    statusPenilaian?: 'Diterima' | 'Tidak Diterima';
    feedback?: string;
    // For Laporan/Tugas documents  
    judulTugas?: string;
    deskripsiTugas?: string;
    // For link submissions
    linkSubmisi?: string;
    // For document submissions
    fileName?: string;
    fileSize?: string;
    fileType?: string;
}

const weeklyReports: WeeklyReport[] = [
    { 
        id: 1, 
        submissionNumber: 'Submisi 1', 
        submittedDate: '28 Jul 2025', 
        status: 'submitted',
        jenisDocument: 'Laporan/Tugas',
        submissionType: 'link',
        isAssessed: true,
        statusPenilaian: 'Diterima',
        feedback: 'Implementasi fitur login sudah baik, dokumentasi lengkap',
        judulTugas: 'Implementasi Fitur Login dengan React',
        deskripsiTugas: 'Membuat sistem autentikasi menggunakan React dan Laravel',
        linkSubmisi: 'https://github.com/hashfi/pkl-login-feature'
    },
    { 
        id: 2, 
        submissionNumber: 'Submisi 2', 
        submittedDate: '04 Agu 2025', 
        status: 'submitted',
        jenisDocument: 'Laporan/Tugas',
        submissionType: 'document',
        isAssessed: true,
        statusPenilaian: 'Tidak Diterima',
        feedback: 'Laporan perlu perbaikan pada bagian analisis dan testing',
        judulTugas: 'Laporan Analisis Dashboard Analytics',
        deskripsiTugas: 'Dokumentasi lengkap pengembangan dashboard dengan Chart.js',
        fileName: 'Laporan_Dashboard_Analytics.pdf',
        fileSize: '2.5 MB',
        fileType: 'PDF'
    },
    { 
        id: 3, 
        submissionNumber: 'Submisi 3', 
        submittedDate: '11 Agu 2025', 
        status: 'submitted',
        jenisDocument: 'Laporan/Tugas',
        submissionType: 'link',
        isAssessed: false,
        judulTugas: 'API Integration dengan Third Party Services',
        deskripsiTugas: 'Integrasi dengan API eksternal untuk fitur payment gateway',
        linkSubmisi: 'https://github.com/hashfi/pkl-api-integration'
    },
    { 
        id: 4, 
        submissionNumber: 'Submisi 4', 
        submittedDate: '18 Agu 2025', 
        status: 'submitted',
        jenisDocument: 'Laporan/Tugas',
        submissionType: 'document',
        isAssessed: true,
        statusPenilaian: 'Diterima',
        feedback: 'Dokumentasi database optimization sangat detail dan implementasi baik',
        judulTugas: 'Dokumentasi Database Optimization',
        deskripsiTugas: 'Laporan lengkap optimisasi query database dan implementasi indexing',
        fileName: 'Database_Optimization_Report.docx',
        fileSize: '1.8 MB',
        fileType: 'DOCX'
    },
    { 
        id: 5, 
        submissionNumber: 'Submisi 5', 
        submittedDate: '25 Agu 2025', 
        status: 'submitted',
        jenisDocument: 'Laporan/Tugas',
        submissionType: 'link',
        isAssessed: true,
        statusPenilaian: 'Diterima',
        feedback: 'Penerapan security yang baik dan testing comprehensive',
        judulTugas: 'Security Implementation dan Authentication',
        deskripsiTugas: 'Implementasi security features seperti rate limiting, CORS, dan JWT authentication',
        linkSubmisi: 'https://github.com/hashfi/pkl-security'
    },
    { 
        id: 6, 
        submissionNumber: 'Submisi 6', 
        submittedDate: '01 Sep 2025', 
        status: 'submitted',
        jenisDocument: 'Laporan/Tugas',
        submissionType: 'document',
        isAssessed: false,
        judulTugas: 'Laporan Mobile App Development',
        deskripsiTugas: 'Dokumentasi pengembangan aplikasi mobile companion menggunakan React Native',
        fileName: 'Mobile_App_Development.pdf',
        fileSize: '3.2 MB',
        fileType: 'PDF'
    },
    { 
        id: 7, 
        submissionNumber: 'Submisi 7', 
        submittedDate: '08 Sep 2025', 
        status: 'submitted',
        jenisDocument: 'Laporan/Tugas',
        submissionType: 'link',
        isAssessed: true,
        statusPenilaian: 'Tidak Diterima',
        feedback: 'Perlu perbaikan pada error handling dan user experience',
        judulTugas: 'DevOps dan Deployment Automation',
        deskripsiTugas: 'Setup CI/CD pipeline menggunakan GitHub Actions dan Docker',
        linkSubmisi: 'https://github.com/hashfi/pkl-devops'
    },
    { 
        id: 8, 
        submissionNumber: 'Submisi 8', 
        status: 'pending',
        jenisDocument: '',
        submissionType: '',
        isAssessed: false
    }
];

export default function DetailPenilaianPKL() {
    const [isPenilaianModalOpen, setIsPenilaianModalOpen] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<WeeklyReport | null>(null);
    
    // Assessment form state
    const [assessmentForm, setAssessmentForm] = useState({
        statusPenilaian: '',
        feedback: ''
    });

    const handleViewSubmission = (submission: WeeklyReport) => {
        setSelectedSubmission(submission);
        setIsSubmissionModalOpen(true);
        // Initialize form with existing data if assessed
        if (submission.isAssessed) {
            setAssessmentForm({
                statusPenilaian: submission.statusPenilaian || '',
                feedback: submission.feedback || ''
            });
        } else {
            setAssessmentForm({
                statusPenilaian: '',
                feedback: ''
            });
        }
    };

    const handleSaveAssessment = () => {
        // In real app, this would make an API call
        console.log('Saving assessment:', {
            submissionId: selectedSubmission?.id,
            ...assessmentForm
        });
        
        // Update the submission in the local state (in real app, refetch data)
        if (selectedSubmission) {
            const updatedReports = weeklyReports.map(report => 
                report.id === selectedSubmission.id 
                    ? { 
                        ...report, 
                        isAssessed: true, 
                        statusPenilaian: assessmentForm.statusPenilaian as 'Diterima' | 'Tidak Diterima',
                        feedback: assessmentForm.feedback 
                    }
                    : report
            );
            // In real app, you would update the state properly
        }
        
        setIsSubmissionModalOpen(false);
        setAssessmentForm({ statusPenilaian: '', feedback: '' });
    };
    const [penilaianData, setPenilaianData] = useState({
        status: '',
        catatan: '',
        nilai: ''
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Penilaian PKL', href: '/admin/penilaian-pkl' },
        { title: mockPeserta.nama, href: '#' }
    ];

    const handleSavePenilaian = () => {
        console.log('Saving penilaian:', {
            pesertaId: mockPeserta.id,
            ...penilaianData
        });
        setIsPenilaianModalOpen(false);
        setPenilaianData({
            status: '',
            catatan: '',
            nilai: ''
        });
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Penilaian PKL - ${mockPeserta.nama}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/admin/penilaian-pkl">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{mockPeserta.nama}</h1>
                            <p className="text-muted-foreground font-serif">
                                Detail penilaian dan progress PKL
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Student Information */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Student Info Card */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Nama</Label>
                                        <p className="text-sm">{mockPeserta.nama}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Sekolah/Universitas</Label>
                                        <p className="text-sm">{mockPeserta.sekolahUniversitas}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Jurusan/Konsentrasi</Label>
                                        <p className="text-sm">{mockPeserta.jurusan}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Periode PKL</Label>
                                        <p className="text-sm">{mockPeserta.periodePKL}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Posisi PKL</Label>
                                        <p className="text-sm">{mockPeserta.posisiPKL}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assessment Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Penilaian Akhir Program</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium">Kelulusan?</Label>
                                        <div className="flex gap-4 mt-2">
                                            <label className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                                                <input
                                                    type="radio"
                                                    name="kelulusan"
                                                    value="Lulus"
                                                    disabled
                                                    className="text-gray-400"
                                                />
                                                <span className="text-gray-400">Lulus</span>
                                            </label>
                                            <label className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                                                <input
                                                    type="radio"
                                                    name="kelulusan"
                                                    value="Tidak Lulus"
                                                    disabled
                                                    className="text-gray-400"
                                                />
                                                <span className="text-gray-400">Tidak Lulus</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-400">Link Sertifikat Kelulusan</Label>
                                        <input
                                            type="url"
                                            disabled
                                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
                                            placeholder="https://example.com/certificate"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-400">Catatan & Feedback Final</Label>
                                        <Textarea
                                            disabled
                                            className="mt-1 bg-gray-50 text-gray-400 cursor-not-allowed"
                                            placeholder="Catatan penilaian akhir..."
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <Button 
                                    disabled 
                                    className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                                >
                                    Simpan Penilaian & Selesaikan PKL
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Submission Reports */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Submission Tugas & Laporan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {weeklyReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{report.submissionNumber}</span>
                                                    {/* Submission type indicator */}
                                                    {report.submissionType === 'link' && (
                                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            Link
                                                        </Badge>
                                                    )}
                                                    {report.submissionType === 'document' && (
                                                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                                            <File className="h-3 w-3 mr-1" />
                                                            Dokumen
                                                        </Badge>
                                                    )}
                                                </div>
                                                {report.submittedDate && (
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {report.submittedDate}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {report.status === 'submitted' ? (
                                                    <>
                                                        {/* Assessment Status Chip */}
                                                        <Badge 
                                                            variant={report.isAssessed ? 'default' : 'outline'}
                                                            className={report.isAssessed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                                                        >
                                                            {report.isAssessed ? 'Sudah Dinilai' : 'Belum Dinilai'}
                                                        </Badge>
                                                        
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewSubmission(report)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Lihat
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Badge variant="outline" className="text-gray-500">
                                                        Belum Submit
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Submission Detail Modal */}
            <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Submisi</DialogTitle>
                        <DialogDescription>
                            Informasi detail submisi peserta PKL
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedSubmission && (
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div>
                                    <label className="font-medium text-gray-600">Submisi</label>
                                    <p className="mt-1 text-lg font-semibold">{selectedSubmission.submissionNumber}</p>
                                </div>
                            </div>

                            {/* Content based on document type */}
                            {selectedSubmission.jenisDocument === 'Laporan/Tugas' && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800">Detail Tugas</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="font-medium text-gray-600">Judul Tugas</label>
                                            <p className="mt-1 bg-gray-50 p-3 rounded border">{selectedSubmission.judulTugas}</p>
                                        </div>
                                        
                                        {/* Display based on submission type */}
                                        {selectedSubmission.submissionType === 'link' && selectedSubmission.linkSubmisi && (
                                            <div>
                                                <label className="font-medium text-gray-600">Link Submisi</label>
                                                <div className="mt-1 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                                                    <ExternalLink className="h-4 w-4 text-blue-600" />
                                                    <a 
                                                        href={selectedSubmission.linkSubmisi} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 underline break-all flex-1"
                                                    >
                                                        {selectedSubmission.linkSubmisi}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {selectedSubmission.submissionType === 'document' && (
                                            <div>
                                                <label className="font-medium text-gray-600">Dokumen Submisi</label>
                                                <div className="mt-1 p-3 bg-gray-50 border rounded">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <File className="h-8 w-8 text-gray-500" />
                                                            <div>
                                                                <p className="font-medium text-gray-800">{selectedSubmission.fileName}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {selectedSubmission.fileType} • {selectedSubmission.fileSize}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="flex items-center gap-2"
                                                            onClick={() => {
                                                                // In real app, this would download the file
                                                                console.log('Downloading file:', selectedSubmission.fileName);
                                                            }}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Assessment Section */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-800">Penilaian</h4>
                                    <Badge 
                                        variant={selectedSubmission.isAssessed ? 'default' : 'outline'}
                                        className={selectedSubmission.isAssessed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                                    >
                                        {selectedSubmission.isAssessed ? 'Sudah Dinilai' : 'Belum Dinilai'}
                                    </Badge>
                                </div>
                                
                                {selectedSubmission.isAssessed ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="text-center">
                                                <label className="font-medium text-gray-600">Status Penilaian</label>
                                                <div className="mt-2">
                                                    <Badge 
                                                        variant={selectedSubmission.statusPenilaian === 'Diterima' ? 'default' : 'destructive'}
                                                        className={`text-lg px-4 py-2 ${
                                                            selectedSubmission.statusPenilaian === 'Diterima' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {selectedSubmission.statusPenilaian}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-medium text-gray-600">Feedback</label>
                                            <p className="mt-1 bg-gray-50 p-3 rounded border text-sm">
                                                {selectedSubmission.feedback || 'Tidak ada feedback'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center py-4 text-gray-500">
                                            <p className="text-sm">Submisi ini belum diberikan penilaian</p>
                                        </div>
                                        
                                        {/* Assessment Form */}
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-sm font-medium">Status Penilaian</Label>
                                                <div className="flex gap-4 mt-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            name="statusPenilaian"
                                                            value="Diterima"
                                                            checked={assessmentForm.statusPenilaian === 'Diterima'}
                                                            onChange={(e) => setAssessmentForm(prev => ({ ...prev, statusPenilaian: e.target.value }))}
                                                            className="text-green-600"
                                                        />
                                                        <span className="text-green-700">Diterima</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            name="statusPenilaian"
                                                            value="Tidak Diterima"
                                                            checked={assessmentForm.statusPenilaian === 'Tidak Diterima'}
                                                            onChange={(e) => setAssessmentForm(prev => ({ ...prev, statusPenilaian: e.target.value }))}
                                                            className="text-red-600"
                                                        />
                                                        <span className="text-red-700">Tidak Diterima</span>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <Label className="text-sm font-medium">Feedback</Label>
                                                <Textarea
                                                    value={assessmentForm.feedback}
                                                    onChange={(e) => setAssessmentForm(prev => ({ ...prev, feedback: e.target.value }))}
                                                    placeholder="Berikan feedback untuk submisi ini..."
                                                    rows={3}
                                                    className="mt-1"
                                                />
                                            </div>
                                            
                                            <Button 
                                                onClick={handleSaveAssessment}
                                                disabled={!assessmentForm.statusPenilaian}
                                                className="w-full"
                                            >
                                                Simpan Penilaian
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
