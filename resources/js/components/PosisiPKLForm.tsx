import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PosisiPKLData {
    id: number;
    namaPosisi: string;
    kategoriPosisi: string;
    durasi: string;
    wfhWfoHybrid: 'WFH' | 'WFO' | 'Hybrid';
    deskripsi: string;
    requirements: string[];
    benefits: string[];
    pesertaTerdaftar: number;
    status: 'Aktif' | 'Draf' | 'Ditutup';
    tanggalDibuat: string;
    tanggalDiperbarui: string;
}

interface PosisiPKLFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: PosisiPKLData) => void;
    editData?: PosisiPKLData | null;
}

export default function PosisiPKLForm({
    isOpen,
    onClose,
    onSave,
    editData
}: PosisiPKLFormProps) {
    const [formData, setFormData] = useState({
        namaPosisi: '',
        kategoriPosisi: '',
        durasi: '',
        wfhWfoHybrid: 'Hybrid' as 'WFH' | 'WFO' | 'Hybrid',
        deskripsi: '',
        requirements: '',
        benefits: '',
        status: 'Draf' as 'Aktif' | 'Draf' | 'Ditutup'
    });

    // Reset form when modal opens/closes or edit data changes
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setFormData({
                    namaPosisi: editData.namaPosisi,
                    kategoriPosisi: editData.kategoriPosisi,
                    durasi: editData.durasi,
                    wfhWfoHybrid: editData.wfhWfoHybrid,
                    deskripsi: editData.deskripsi,
                    requirements: editData.requirements.join('\n'),
                    benefits: editData.benefits.join('\n'),
                    status: editData.status
                });
            } else {
                setFormData({
                    namaPosisi: '',
                    kategoriPosisi: '',
                    durasi: '',
                    wfhWfoHybrid: 'Hybrid',
                    deskripsi: '',
                    requirements: '',
                    benefits: '',
                    status: 'Draf'
                });
            }
        }
    }, [isOpen, editData]);

    const handleSave = () => {
        const now = new Date().toISOString().split('T')[0];
        const savedData: PosisiPKLData = {
            id: editData?.id || 0, // Will be overridden in parent
            namaPosisi: formData.namaPosisi,
            kategoriPosisi: formData.kategoriPosisi,
            durasi: formData.durasi,
            wfhWfoHybrid: formData.wfhWfoHybrid,
            deskripsi: formData.deskripsi,
            requirements: formData.requirements.split('\n').filter(req => req.trim() !== ''),
            benefits: formData.benefits.split('\n').filter(benefit => benefit.trim() !== ''),
            pesertaTerdaftar: editData?.pesertaTerdaftar || 0,
            status: formData.status,
            tanggalDibuat: editData?.tanggalDibuat || now,
            tanggalDiperbarui: now
        };
        onSave(savedData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl min-w-[300px] md:min-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editData ? 'Edit Posisi PKL' : 'Tambah Posisi PKL'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="namaPosisi">Nama Posisi</Label>
                            <Input
                                id="namaPosisi"
                                value={formData.namaPosisi}
                                onChange={(e) => setFormData({ ...formData, namaPosisi: e.target.value })}
                                placeholder="Masukkan nama posisi"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kategoriPosisi">Kategori Posisi</Label>
                            <Select
                                value={formData.kategoriPosisi}
                                onValueChange={(value) => setFormData({ ...formData, kategoriPosisi: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori posisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Developer">Developer</SelectItem>
                                    <SelectItem value="Kreatif">Kreatif</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="durasi">Durasi</Label>
                            <Select
                                value={formData.durasi}
                                onValueChange={(value) => setFormData({ ...formData, durasi: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih durasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Project-Based">Project-Based</SelectItem>
                                    <SelectItem value="3 Bulan">3 Bulan</SelectItem>
                                    <SelectItem value="6 Bulan">6 Bulan</SelectItem>
                                    <SelectItem value="1 Tahun">1 Tahun</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wfhWfoHybrid">Tipe Kerja</Label>
                            <Select
                                value={formData.wfhWfoHybrid}
                                onValueChange={(value: 'WFH' | 'WFO' | 'Hybrid') => setFormData({ ...formData, wfhWfoHybrid: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe kerja" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WFH">Work From Home</SelectItem>
                                    <SelectItem value="WFO">Work From Office</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'Aktif' | 'Draf' | 'Ditutup') => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draf">Draf</SelectItem>
                                    <SelectItem value="Aktif">Aktif</SelectItem>
                                    <SelectItem value="Ditutup">Ditutup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi Posisi</Label>
                        <Textarea
                            id="deskripsi"
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            placeholder="Masukkan deskripsi posisi"
                            rows={4}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements (pisahkan dengan enter)</Label>
                            <Textarea
                                id="requirements"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                placeholder="Requirement 1&#10;Requirement 2"
                                rows={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="benefits">Benefits (pisahkan dengan enter)</Label>
                            <Textarea
                                id="benefits"
                                value={formData.benefits}
                                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                placeholder="Benefit 1&#10;Benefit 2"
                                rows={6}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button onClick={handleSave}>
                        {editData ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
