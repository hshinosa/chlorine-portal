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
    File,
    Award,
    Clock,
    User,
    Calendar
} from 'lucide-react';

interface PesertaSertifikasi {
    id: number;
    nama: string;
    email: string;
    noTelepon: string;
    instansi: string;
    jabatan: string;
    sertifikasi: string;
    batch: string;
    statusPenilaian: 'Belum Dinilai' | 'Sedang Berjalan' | 'Lulus' | 'Tidak Lulus';
    progress: number;
    tanggalDaftar: string;
    tanggalUjian: string;
    assessor: string;
    jenisSertifikasi: 'BNSP' | 'Industri';
    alamat: string;
    pendidikan: string;
    pengalaman: string;
    motivasi: string;
}

interface AssessmentComponent {
    id: number;
    nama: string;
    tipe: 'Tes Tulis' | 'Praktik' | 'Wawancara' | 'Portfolio';
    deskripsi: string;
    bobot: number;
    nilai: number | null;
    status: 'Belum Dinilai' | 'Sudah Dinilai';
    catatan: string;
    dokumen?: string;
}

// Mock data peserta berdasarkan ID
const mockPesertaData: PesertaSertifikasi = {
    id: 1,
    nama: 'Muhammad Hashfi Hadyan',
    email: 'hashfi@company.com',
    noTelepon: '081234567890',
    instansi: 'PT Tech Indonesia',
    jabatan: 'Digital Marketing Specialist',
    sertifikasi: 'Digital Marketing Professional',
    batch: 'Batch 2025-03',
    statusPenilaian: 'Sedang Berjalan',
    progress: 75,
    tanggalDaftar: '15-05-2025',
    tanggalUjian: '21-06-2025',
    assessor: 'Ahmad Jaelani',
    jenisSertifikasi: 'Industri',
    alamat: 'Jl. Sudirman No. 123, Jakarta Selatan',
    pendidikan: 'S1 Manajemen - Universitas Indonesia',
    pengalaman: '3 tahun di bidang digital marketing',
    motivasi: 'Ingin meningkatkan kompetensi dan karir di bidang digital marketing'
};

// Mock data komponen penilaian
const mockAssessmentData: AssessmentComponent[] = [
    {
        id: 1,
        nama: 'Tes Pengetahuan Digital Marketing',
        tipe: 'Tes Tulis',
        deskripsi: 'Ujian tertulis tentang konsep dasar digital marketing, SEO, SEM, dan analytics',
        bobot: 30,
        nilai: 85,
        status: 'Sudah Dinilai',
        catatan: 'Pemahaman konsep sangat baik, terutama dalam analisis campaign metrics'
    },
    {
        id: 2,
        nama: 'Praktik Campaign Strategy',
        tipe: 'Praktik',
        deskripsi: 'Membuat strategi kampanye digital marketing untuk studi kasus yang diberikan',
        bobot: 40,
        nilai: 78,
        status: 'Sudah Dinilai',
        catatan: 'Strategi cukup baik, namun perlu peningkatan dalam budget allocation',
        dokumen: 'campaign-strategy.pdf'
    },
    {
        id: 3,
        nama: 'Presentasi dan Wawancara',
        tipe: 'Wawancara',
        deskripsi: 'Presentasi hasil praktik dan wawancara kompetensi',
        bobot: 20,
        nilai: null,
        status: 'Belum Dinilai',
        catatan: ''
    },
    {
        id: 4,
        nama: 'Portfolio Digital Marketing',
        tipe: 'Portfolio',
        deskripsi: 'Kumpulan portfolio project digital marketing yang pernah dikerjakan',
        bobot: 10,
        nilai: 82,
        status: 'Sudah Dinilai',
        catatan: 'Portfolio menunjukkan pengalaman yang relevan dan hasil yang baik',
        dokumen: 'portfolio-collection.pdf'
    }
];

export default function DetailPenilaianSertifikasi() {
    const [pesertaData] = useState<PesertaSertifikasi>(mockPesertaData);
    const [assessmentData, setAssessmentData] = useState<AssessmentComponent[]>(mockAssessmentData);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<AssessmentComponent | null>(null);
    const [gradeForm, setGradeForm] = useState({
        nilai: '',
        catatan: ''
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Penilaian', href: '#' },
        { title: 'Sertifikasi', href: '/admin/penilaian-sertifikasi' },
        { title: pesertaData.nama, href: '#' }
    ];

    // Calculate total score
    const calculateTotalScore = () => {
        let totalScore = 0;
        let totalBobot = 0;
        
        assessmentData.forEach(component => {
            if (component.nilai !== null) {
                totalScore += component.nilai * (component.bobot / 100);
                totalBobot += component.bobot;
            }
        });
        
        return totalBobot > 0 ? Math.round((totalScore / totalBobot) * 100) : 0;
    };

    const handleGrade = (component: AssessmentComponent) => {
        setSelectedComponent(component);
        setGradeForm({
            nilai: component.nilai?.toString() || '',
            catatan: component.catatan || ''
        });
        setShowGradeModal(true);
    };

    const handleSaveGrade = () => {
        if (selectedComponent) {
            const updatedData = assessmentData.map(component => 
                component.id === selectedComponent.id 
                    ? { 
                        ...component, 
                        nilai: parseFloat(gradeForm.nilai), 
                        catatan: gradeForm.catatan,
                        status: 'Sudah Dinilai' as const
                    }
                    : component
            );
            setAssessmentData(updatedData);
            setShowGradeModal(false);
            setSelectedComponent(null);
            setGradeForm({ nilai: '', catatan: '' });
        }
    };

    const handleFinalize = () => {
        const allGraded = assessmentData.every(component => component.status === 'Sudah Dinilai');
        if (allGraded) {
            const finalScore = calculateTotalScore();
            const status = finalScore >= 70 ? 'Lulus' : 'Tidak Lulus';
            alert(`Penilaian selesai! Nilai akhir: ${finalScore}, Status: ${status}`);
            // Update status and redirect
            router.visit('/admin/penilaian-sertifikasi');
        } else {
            alert('Harap selesaikan penilaian semua komponen terlebih dahulu');
        }
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

    const getJenisBadgeColor = (jenis: string) => {
        return jenis === 'BNSP' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
    };

    const totalScore = calculateTotalScore();
    const completedComponents = assessmentData.filter(c => c.status === 'Sudah Dinilai').length;
    const totalComponents = assessmentData.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Penilaian - ${pesertaData.nama}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header dengan tombol kembali */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/penilaian-sertifikasi" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detail Penilaian Sertifikasi</h1>
                        <p className="text-muted-foreground font-serif">
                            Kelola penilaian dan evaluasi peserta sertifikasi
                        </p>
                    </div>
                </div>

                {/* Informasi Peserta dan Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Biodata Peserta */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informasi Peserta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Nama Lengkap</Label>
                                    <p className="font-medium">{pesertaData.nama}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                    <p className="font-medium">{pesertaData.email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">No. Telepon</Label>
                                    <p className="font-medium">{pesertaData.noTelepon}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Instansi</Label>
                                    <p className="font-medium">{pesertaData.instansi}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Jabatan</Label>
                                    <p className="font-medium">{pesertaData.jabatan}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Pendidikan</Label>
                                    <p className="font-medium">{pesertaData.pendidikan}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Alamat</Label>
                                <p className="font-medium">{pesertaData.alamat}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Pengalaman</Label>
                                <p className="font-medium">{pesertaData.pengalaman}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Motivasi</Label>
                                <p className="font-medium">{pesertaData.motivasi}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Sertifikasi dan Progress */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Informasi Sertifikasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Nama Sertifikasi</Label>
                                    <p className="font-medium">{pesertaData.sertifikasi}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Batch</Label>
                                    <p className="font-medium">{pesertaData.batch}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Jenis Sertifikasi</Label>
                                    <Badge className={getJenisBadgeColor(pesertaData.jenisSertifikasi)}>
                                        {pesertaData.jenisSertifikasi}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Assessor</Label>
                                    <p className="font-medium">{pesertaData.assessor}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Tanggal Ujian</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {pesertaData.tanggalUjian}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <Badge variant={getStatusBadgeVariant(pesertaData.statusPenilaian)}>
                                        {pesertaData.statusPenilaian}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Progress Penilaian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span>Komponen Selesai</span>
                                        <span>{completedComponents}/{totalComponents}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(completedComponents / totalComponents) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Nilai Sementara</Label>
                                    <p className="text-2xl font-bold">{totalScore}/100</p>
                                </div>
                                {completedComponents === totalComponents && (
                                    <Button onClick={handleFinalize} className="w-full">
                                        Finalisasi Penilaian
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Komponen Penilaian */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Komponen Penilaian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assessmentData.map((component) => (
                                <Card key={component.id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold">{component.nama}</h3>
                                                    <Badge variant="outline">{component.tipe}</Badge>
                                                    <Badge variant="secondary">Bobot: {component.bobot}%</Badge>
                                                    <Badge 
                                                        variant={component.status === 'Sudah Dinilai' ? 'default' : 'outline'}
                                                    >
                                                        {component.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {component.deskripsi}
                                                </p>
                                                {component.nilai !== null && (
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">Nilai:</span>
                                                            <span className="text-lg font-bold text-blue-600">
                                                                {component.nilai}/100
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {component.catatan && (
                                                    <div className="bg-gray-50 p-3 rounded-md">
                                                        <span className="text-sm font-medium text-muted-foreground">Catatan:</span>
                                                        <p className="text-sm mt-1">{component.catatan}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {component.dokumen && (
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Unduh
                                                    </Button>
                                                )}
                                                <Button 
                                                    onClick={() => handleGrade(component)}
                                                    variant={component.status === 'Sudah Dinilai' ? 'secondary' : 'default'}
                                                    size="sm"
                                                >
                                                    {component.status === 'Sudah Dinilai' ? 'Edit Nilai' : 'Beri Nilai'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Modal Penilaian */}
                <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Penilaian Komponen</DialogTitle>
                            <DialogDescription>
                                {selectedComponent?.nama} - {selectedComponent?.tipe}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="nilai">Nilai (0-100)</Label>
                                <Input
                                    id="nilai"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gradeForm.nilai}
                                    onChange={(e) => setGradeForm(prev => ({ ...prev, nilai: e.target.value }))}
                                    placeholder="Masukkan nilai"
                                />
                            </div>
                            <div>
                                <Label htmlFor="catatan">Catatan Penilaian</Label>
                                <Textarea
                                    id="catatan"
                                    rows={4}
                                    value={gradeForm.catatan}
                                    onChange={(e) => setGradeForm(prev => ({ ...prev, catatan: e.target.value }))}
                                    placeholder="Masukkan catatan penilaian..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowGradeModal(false)}>
                                Batal
                            </Button>
                            <Button 
                                onClick={handleSaveGrade}
                                disabled={!gradeForm.nilai || parseFloat(gradeForm.nilai) < 0 || parseFloat(gradeForm.nilai) > 100}
                            >
                                Simpan Nilai
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
