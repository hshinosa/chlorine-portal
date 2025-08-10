import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, User, Save, GripVertical, Loader2 } from 'lucide-react';
import { sertifikasiService } from '@/services/sertifikasiService';
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/components/ui/toast';

// Sortable Module Item Component
interface SortableModulItemProps {
    modul: ModulSertifikasi;
    onEdit: (modul: ModulSertifikasi) => void;
    onDelete: (id: number) => void;
}

function SortableModulItem({ modul, onEdit, onDelete }: SortableModulItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: modul.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
                <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{modul.judul}</h4>
                        <p className="text-sm text-gray-600 mt-1 truncate">{modul.deskripsi}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(modul)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(modul.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ModulSertifikasi {
    id: number;
    judul: string;
    deskripsi: string;
    order: number;
}

interface BatchData {
    id: number;
    nama: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    status: 'Draf' | 'Aktif' | 'Selesai';
}

interface SertifikasiFormData {
    namaSertifikasi: string;
    jenisSertifikasi: string;
    deskripsi: string;
    thumbnail: File | null;
    modul: ModulSertifikasi[];
    namaAsesor: string;
    jabatanAsesor: string;
    instansiAsesor: string;
    tipeSertifikat: string;
    batch: BatchData[];
    fotoAsesor: File | null;
    kapasitasPeserta: number;
    pengalamanAsesor: string;
    statusSertifikasi: string;
}

interface SertifikasiData {
    namaSertifikasi?: string;
    jenisSertifikasi?: string;
    deskripsi?: string;
    modul?: ModulSertifikasi[];
    namaAsesor?: string;
    jabatanAsesor?: string;
    instansiAsesor?: string;
    tipeSertifikat?: string;
    batch?: BatchData[];
}

interface Props {
    sertifikasiId?: string;
    sertifikasiData?: SertifikasiData;
}

export default function FormSertifikasi({ sertifikasiId, sertifikasiData }: Props) {
    const isEdit = !!sertifikasiId;
    const { toast } = useToast();
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Sertifikasi Kompetensi', href: '/admin/sertifikasi-kompetensi' },
        { title: isEdit ? 'Edit Sertifikasi' : 'Buat Sertifikasi', href: '#' }
    ];

    // Form state
    const [formData, setFormData] = useState<SertifikasiFormData>({
        namaSertifikasi: sertifikasiData?.namaSertifikasi || '',
        jenisSertifikasi: sertifikasiData?.jenisSertifikasi || '',
        deskripsi: sertifikasiData?.deskripsi || '',
        thumbnail: null,
        modul: sertifikasiData?.modul || [],
        namaAsesor: sertifikasiData?.namaAsesor || '',
        jabatanAsesor: sertifikasiData?.jabatanAsesor || '',
        instansiAsesor: sertifikasiData?.instansiAsesor || '',
        tipeSertifikat: sertifikasiData?.tipeSertifikat || '',
        batch: sertifikasiData?.batch || [],
        fotoAsesor: null,
        kapasitasPeserta: 0,
        pengalamanAsesor: '',
        statusSertifikasi: 'draft'
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const isDirtyRef = useRef(false);

    // Modal states
    const [isModulModalOpen, setIsModulModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [editingModul, setEditingModul] = useState<ModulSertifikasi | null>(null);
    const [editingBatch, setEditingBatch] = useState<BatchData | null>(null);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Modul form state
    const [modulForm, setModulForm] = useState({
        judul: '',
        deskripsi: ''
    });

    // Batch form state
    const [batchForm, setBatchForm] = useState<{
        nama: string;
        tanggalMulai: string;
        tanggalSelesai: string;
        status: 'Draf' | 'Aktif' | 'Selesai';
    }>({
        nama: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        status: 'Draf'
    });

    // Handlers untuk form utama
    const markDirty = () => { isDirtyRef.current = true; };
    useUnsavedChanges(isDirtyRef.current);
    const handleInputChange = (field: keyof SertifikasiFormData, value: string | File | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        markDirty();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
    setFormData(prev => ({
            ...prev,
            thumbnail: file
        }));
    markDirty();
    };

    const handleFotoAsesorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
    setFormData(prev => ({
            ...prev,
            fotoAsesor: file
        }));
    markDirty();
    };

    // Drag and drop handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setFormData(prev => {
                const oldIndex = prev.modul.findIndex(item => item.id === active.id);
                const newIndex = prev.modul.findIndex(item => item.id === over?.id);
                
                const newModuls = arrayMove(prev.modul, oldIndex, newIndex);
                
                // Update order values
                const updatedModuls = newModuls.map((modul, index) => ({
                    ...modul,
                    order: index
                }));

                // Debounce persist
                if (isEdit && sertifikasiId) {
                    if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
                    reorderTimeout.current = setTimeout(async () => {
                        try {
                            await sertifikasiService.reorderModul(Number(sertifikasiId), updatedModuls);
                        } catch (err) {
                            toast({ type: 'error', title: 'Gagal', message: 'Gagal menyimpan urutan modul' });
                        }
                    }, 600);
                }

                return {
                    ...prev,
                    modul: updatedModuls
                };
            });
        }
    };

    // Handlers untuk modul
    const handleAddModul = () => {
        setEditingModul(null);
        setModulForm({ judul: '', deskripsi: '' });
        setIsModulModalOpen(true);
    };

    const handleEditModul = (modul: ModulSertifikasi) => {
        setEditingModul(modul);
        setModulForm({ judul: modul.judul, deskripsi: modul.deskripsi });
        setIsModulModalOpen(true);
    };

    const handleSaveModul = () => {
        if (editingModul) {
            // Edit existing module
            setFormData(prev => ({
                ...prev,
                modul: prev.modul.map(m => 
                    m.id === editingModul.id 
                        ? { ...m, judul: modulForm.judul, deskripsi: modulForm.deskripsi }
                        : m
                )
            }));
        } else {
            // Add new module
            const newModul: ModulSertifikasi = {
                id: Date.now(),
                judul: modulForm.judul,
                deskripsi: modulForm.deskripsi,
                order: formData.modul.length
            };
            setFormData(prev => ({
                ...prev,
                modul: [...prev.modul, newModul]
            }));
        }
        setIsModulModalOpen(false);
        setModulForm({ judul: '', deskripsi: '' });
    };

    const handleDeleteModul = (id: number) => {
        setFormData(prev => ({
            ...prev,
            modul: prev.modul.filter(m => m.id !== id)
        }));
    };

    // Handlers untuk batch
    const handleAddBatch = () => {
        setEditingBatch(null);
        setBatchForm({ nama: '', tanggalMulai: '', tanggalSelesai: '', status: 'Draf' });
        setIsBatchModalOpen(true);
    };

    const handleEditBatch = (batch: BatchData) => {
        setEditingBatch(batch);
        setBatchForm({
            nama: batch.nama,
            tanggalMulai: batch.tanggalMulai,
            tanggalSelesai: batch.tanggalSelesai,
            status: batch.status as 'Draf' | 'Aktif' | 'Selesai'
        });
        setIsBatchModalOpen(true);
    };

    const handleSaveBatch = () => {
        if (editingBatch) {
            // Edit existing batch
            setFormData(prev => ({
                ...prev,
                batch: prev.batch.map(b => 
                    b.id === editingBatch.id 
                        ? { ...b, ...batchForm }
                        : b
                )
            }));
        } else {
            // Add new batch
            const newBatch: BatchData = {
                id: Date.now(),
                ...batchForm
            };
            setFormData(prev => ({
                ...prev,
                batch: [...prev.batch, newBatch]
            }));
        }
        setIsBatchModalOpen(false);
        setBatchForm({ nama: '', tanggalMulai: '', tanggalSelesai: '', status: 'Draf' });
    };

    const handleDeleteBatch = (id: number) => {
        setFormData(prev => ({
            ...prev,
            batch: prev.batch.filter(b => b.id !== id)
        }));
    };

    // Handler untuk submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setError(null); setSuccess(null);
        try {
            const payload: Record<string, any> = {
                nama_sertifikasi: formData.namaSertifikasi,
                jenis_sertifikasi: formData.jenisSertifikasi,
                deskripsi: formData.deskripsi,
                nama_asesor: formData.namaAsesor,
                jabatan_asesor: formData.jabatanAsesor,
                instansi_asesor: formData.instansiAsesor,
                pengalaman_asesor: formData.pengalamanAsesor,
                tipe_sertifikat: formData.tipeSertifikat,
                kapasitas_peserta: formData.kapasitasPeserta,
                status: formData.statusSertifikasi,
                modul: formData.modul.map(m => ({ judul: m.judul, deskripsi: m.deskripsi, order: m.order })),
                batch: formData.batch.map(b => ({ nama: b.nama, tanggal_mulai: b.tanggalMulai, tanggal_selesai: b.tanggalSelesai, status: b.status }))
            };
            if (formData.thumbnail) payload.thumbnail = formData.thumbnail;
            if (formData.fotoAsesor) payload.foto_asesor = formData.fotoAsesor;
            const hasFile = !!(formData.thumbnail || formData.fotoAsesor);
            if (hasFile) {
                payload.modul = JSON.stringify(payload.modul);
                payload.batch = JSON.stringify(payload.batch);
            }
            if (isEdit && sertifikasiId) {
                await sertifikasiService.updateSertifikasi(Number(sertifikasiId), payload);
                setSuccess('Sertifikasi diperbarui');
                toast({ type: 'success', title: 'Berhasil', message: 'Sertifikasi diperbarui' });
            } else {
                await sertifikasiService.createSertifikasi(payload);
                setSuccess('Sertifikasi dibuat');
                toast({ type: 'success', title: 'Berhasil', message: 'Sertifikasi dibuat' });
                setFormData(prev => ({ ...prev, namaSertifikasi: '', deskripsi: '' }));
                isDirtyRef.current = false;
            }
            setTimeout(()=>{ window.location.href = '/admin/sertifikasi-kompetensi'; }, 800);
        } catch (e: any) {
            setError(e.message || 'Gagal menyimpan sertifikasi');
            toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal menyimpan sertifikasi' });
        } finally { setSubmitting(false); }
    };

    // Prefill data when editing (if data not injected from server-side props)
    useEffect(() => {
        const loadData = async () => {
            if (isEdit && sertifikasiId && !sertifikasiData) {
                try {
                    const data: any = await sertifikasiService.getSertifikasiById(Number(sertifikasiId));
                    // Normalise potential API response keys
                    setFormData(prev => ({
                        ...prev,
                        namaSertifikasi: data.nama_sertifikasi || data.namaSertifikasi || '',
                        jenisSertifikasi: data.jenis_sertifikasi || data.jenisSertifikasi || '',
                        deskripsi: data.deskripsi || '',
                        modul: (data.modul || data.modules || []).map((m: any, idx: number) => ({
                            id: m.id || idx + 1,
                            judul: m.judul || m.title || '',
                            deskripsi: m.deskripsi || m.description || '',
                            order: m.order ?? idx
                        })),
                        namaAsesor: data.nama_asesor || data.namaAsesor || '',
                        jabatanAsesor: data.jabatan_asesor || data.jabatanAsesor || '',
                        instansiAsesor: data.instansi_asesor || data.instansiAsesor || '',
                        tipeSertifikat: data.tipe_sertifikat || data.tipeSertifikat || '',
                        batch: (data.batch || data.batches || []).map((b: any, idx: number) => ({
                            id: b.id || idx + 1,
                            nama: b.nama || b.name || '',
                            tanggalMulai: b.tanggal_mulai || b.tanggalMulai || b.start_date || '',
                            tanggalSelesai: b.tanggal_selesai || b.tanggalSelesai || b.end_date || '',
                            status: (b.status as any) || 'Draf'
                        })),
                        pengalamanAsesor: data.pengalaman_asesor || data.pengalamanAsesor || '',
                        kapasitasPeserta: Number(data.kapasitas_peserta || data.kapasitasPeserta) || 0,
                        statusSertifikasi: data.status || data.statusSertifikasi || 'draft'
                    }));
                } catch (err: any) {
                    toast({ type: 'error', title: 'Gagal', message: err.message || 'Gagal memuat data sertifikasi' });
                }
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, sertifikasiId]);

    // Warn user when navigating away via in-app link (basic intercept)
    // Persist reorder to backend when editing and user stops dragging (debounced)
    const reorderTimeout = useRef<any>(null);
    useEffect(()=>()=>{ if(reorderTimeout.current) clearTimeout(reorderTimeout.current); },[]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Sertifikasi' : 'Buat Sertifikasi'} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/admin/sertifikasi-kompetensi">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {isEdit ? 'Edit Sertifikasi' : 'Buat Sertifikasi Kompetensi'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isEdit ? 'Perbarui informasi sertifikasi' : 'Tambahkan program sertifikasi baru'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Detail Sertifikasi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Sertifikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Top Section: Thumbnail dan Nama Sertifikasi & Jenis */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Thumbnail Sertifikasi */}
                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail">Thumbnail Sertifikasi</Label>
                                    <div 
                                        className="aspect-video w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => document.getElementById('thumbnail')?.click()}
                                    >
                                        {formData.thumbnail ? (
                                            <img 
                                                src={URL.createObjectURL(formData.thumbnail)} 
                                                alt="Thumbnail preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (sertifikasiData && ( (sertifikasiData as any).thumbnail_url || (sertifikasiData as any).thumbnailUrl)) ? (
                                            <img 
                                                src={(sertifikasiData as any).thumbnail_url || (sertifikasiData as any).thumbnailUrl}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <div className="text-2xl mb-2">📷</div>
                                                <div className="text-sm">Upload Thumbnail</div>
                                            </div>
                                        )}
                                        <Input
                                            id="thumbnail"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Nama Sertifikasi dan Jenis */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="namaSertifikasi">Nama Sertifikasi</Label>
                                        <Input
                                            id="namaSertifikasi"
                                            value={formData.namaSertifikasi}
                                            onChange={(e) => handleInputChange('namaSertifikasi', e.target.value)}
                                            placeholder="Masukkan nama sertifikasi"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jenisSertifikasi">Jenis Sertifikasi</Label>
                                        <Select
                                            value={formData.jenisSertifikasi}
                                            onValueChange={(value) => handleInputChange('jenisSertifikasi', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis sertifikasi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BNSP">BNSP</SelectItem>
                                                <SelectItem value="Industri">Industri</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="statusSertifikasi">Status</Label>
                                        <Select value={formData.statusSertifikasi} onValueChange={v=>setFormData(p=>({...p,statusSertifikasi:v}))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Deskripsi Sertifikasi - Full Width */}
                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi Sertifikasi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                                    placeholder="Deskripsi lengkap tentang sertifikasi"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kapasitas">Kapasitas Peserta</Label>
                                    <Input id="kapasitas" type="number" value={formData.kapasitasPeserta} onChange={e=>setFormData(prev=>({...prev, kapasitasPeserta:Number(e.target.value)}))} placeholder="30" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pengalamanAsesor">Pengalaman Asesor</Label>
                                    <Input id="pengalamanAsesor" value={formData.pengalamanAsesor} onChange={e=>setFormData(prev=>({...prev, pengalamanAsesor:e.target.value}))} placeholder="10 tahun industri" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modul Sertifikasi */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Modul Sertifikasi</CardTitle>
                                <Button type="button" onClick={handleAddModul} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Tambah Modul
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {formData.modul.length > 0 ? (
                                <DndContext 
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext 
                                        items={formData.modul.map(m => m.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {formData.modul
                                                .sort((a, b) => a.order - b.order)
                                                .map((modul) => (
                                                    <SortableModulItem
                                                        key={modul.id}
                                                        modul={modul}
                                                        onEdit={handleEditModul}
                                                        onDelete={handleDeleteModul}
                                                    />
                                                ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada modul ditambahkan. Klik "Tambah Modul" untuk memulai.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pengaturan Jadwal Batch */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Pengaturan Jadwal Batch
                                </CardTitle>
                                <Button type="button" onClick={handleAddBatch} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Atur Batch
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {formData.batch.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Batch</TableHead>
                                            <TableHead>Tanggal Mulai</TableHead>
                                            <TableHead>Tanggal Selesai</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[100px]">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formData.batch.map((batch) => (
                                            <TableRow key={batch.id}>
                                                <TableCell className="font-medium">{batch.nama}</TableCell>
                                                <TableCell>{batch.tanggalMulai}</TableCell>
                                                <TableCell>{batch.tanggalSelesai}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        batch.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                                                        batch.status === 'Selesai' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {batch.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditBatch(batch)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteBatch(batch.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada batch dijadwalkan. Klik "Atur Batch" untuk menambahkan jadwal.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Detail Asesor */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Detail Asesor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-start">
                                {/* Foto Asesor */}
                                <div className="space-y-2">
                                    <Label>Foto Asesor</Label>
                                    <div 
                                        className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => document.getElementById('fotoAsesor')?.click()}
                                    >
                                        {formData.fotoAsesor ? (
                                            <img 
                                                src={URL.createObjectURL(formData.fotoAsesor)} 
                                                alt="Foto asesor preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (sertifikasiData && ((sertifikasiData as any).foto_asesor_url || (sertifikasiData as any).fotoAsesorUrl)) ? (
                                            <img 
                                                src={(sertifikasiData as any).foto_asesor_url || (sertifikasiData as any).fotoAsesorUrl}
                                                alt="Foto Asesor"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <div className="text-2xl mb-1">👤</div>
                                                <div className="text-xs">Upload Foto</div>
                                            </div>
                                        )}
                                        <Input
                                            id="fotoAsesor"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFotoAsesorChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Form Fields Asesor */}
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="namaAsesor">Nama Asesor</Label>
                                        <Input
                                            id="namaAsesor"
                                            value={formData.namaAsesor}
                                            onChange={(e) => handleInputChange('namaAsesor', e.target.value)}
                                            placeholder="Nama lengkap asesor"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jabatanAsesor">Jabatan</Label>
                                        <Input
                                            id="jabatanAsesor"
                                            value={formData.jabatanAsesor}
                                            onChange={(e) => handleInputChange('jabatanAsesor', e.target.value)}
                                            placeholder="Jabatan asesor"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instansiAsesor">Instansi</Label>
                                        <Input
                                            id="instansiAsesor"
                                            value={formData.instansiAsesor}
                                            onChange={(e) => handleInputChange('instansiAsesor', e.target.value)}
                                            placeholder="Instansi tempat asesor bekerja"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sertifikat yang Didapatkan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sertifikat yang Didapatkan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="tipeSertifikat">Tipe Sertifikat</Label>
                                <Select
                                    value={formData.tipeSertifikat}
                                    onValueChange={(value) => handleInputChange('tipeSertifikat', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe sertifikat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sertifikat Kompetensi">Sertifikat Kompetensi</SelectItem>
                                        <SelectItem value="Sertifikat Pelatihan">Sertifikat Pelatihan</SelectItem>
                                        <SelectItem value="Sertifikat BNSP">Sertifikat BNSP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    {/* Inline error/success messages replaced by toast notifications */}
                    <div className="flex items-center gap-4 pt-4">
                        <Button asChild variant="outline">
                            <Link href="/admin/sertifikasi-kompetensi">
                                Batal
                            </Link>
                        </Button>
                        <Button type="submit" className="flex items-center gap-2" disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Sertifikasi'}
                        </Button>
                    </div>
                </form>

                {/* Modal Tambah/Edit Modul */}
                <Dialog open={isModulModalOpen} onOpenChange={setIsModulModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingModul ? 'Edit Modul' : 'Tambah Modul'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="judulModul">Judul Modul</Label>
                                <Input
                                    id="judulModul"
                                    value={modulForm.judul}
                                    onChange={(e) => setModulForm({ ...modulForm, judul: e.target.value })}
                                    placeholder="Judul modul pembelajaran"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deskripsiModul">Deskripsi</Label>
                                <Textarea
                                    id="deskripsiModul"
                                    value={modulForm.deskripsi}
                                    onChange={(e) => setModulForm({ ...modulForm, deskripsi: e.target.value })}
                                    placeholder="Deskripsi konten modul"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModulModalOpen(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleSaveModul}>
                                {editingModul ? 'Simpan Perubahan' : 'Tambah Modul'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Tambah/Edit Batch */}
                <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBatch ? 'Edit Batch' : 'Atur Batch'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="namaBatch">Nama Batch</Label>
                                <Input
                                    id="namaBatch"
                                    value={batchForm.nama}
                                    onChange={(e) => setBatchForm({ ...batchForm, nama: e.target.value })}
                                    placeholder="Contoh: Batch 1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                                    <Input
                                        id="tanggalMulai"
                                        type="date"
                                        value={batchForm.tanggalMulai}
                                        onChange={(e) => setBatchForm({ ...batchForm, tanggalMulai: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                                    <Input
                                        id="tanggalSelesai"
                                        type="date"
                                        value={batchForm.tanggalSelesai}
                                        onChange={(e) => setBatchForm({ ...batchForm, tanggalSelesai: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="statusBatch">Status</Label>
                                <Select
                                    value={batchForm.status}
                                    onValueChange={(value) => 
                                        setBatchForm({ ...batchForm, status: value as 'Draf' | 'Aktif' | 'Selesai' })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draf">Draf</SelectItem>
                                        <SelectItem value="Aktif">Aktif</SelectItem>
                                        <SelectItem value="Selesai">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsBatchModalOpen(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleSaveBatch}>
                                {editingBatch ? 'Simpan Perubahan' : 'Tambah Batch'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
