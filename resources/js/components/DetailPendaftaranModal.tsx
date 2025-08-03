import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface untuk biodata peserta
interface BiodataPeserta {
    nama: string;
    tempatTanggalLahir: string;
    alamat: string;
    email: string;
    noTelepon: string;
}

// Interface untuk sertifikasi kompetensi
interface SertifikasiKompetensi {
    namaSertifikasi: string;
    jadwalSertifikasi: string;
    batch: string;
    assessor: string;
}

// Interface untuk data pendaftar lengkap
interface PendaftarData {
    nama: string;
    status: 'Pengajuan' | 'Disetujui' | 'Ditolak';
    biodata: BiodataPeserta;
    sertifikasi: SertifikasiKompetensi;
}

// Props untuk modal
interface DetailPendaftaranModalProps {
    readonly isOpen: boolean;
    readonly pendaftarData: PendaftarData;
    readonly onClose: () => void;
    readonly onApproval: (status: 'Disetujui' | 'Ditolak', alasan?: string) => void;
}

export default function DetailPendaftaranModal({ 
    isOpen, 
    pendaftarData, 
    onClose, 
    onApproval 
}: DetailPendaftaranModalProps) {
    const [rejectionReason, setRejectionReason] = React.useState('');
    const [showRejectionCard, setShowRejectionCard] = React.useState(false);

    const handleApprove = () => {
        onApproval('Disetujui');
        onClose();
    };

    const handleReject = () => {
        setShowRejectionCard(true);
    };

    const handleSubmitRejection = () => {
        if (rejectionReason.trim()) {
            onApproval('Ditolak', rejectionReason);
            setRejectionReason('');
            setShowRejectionCard(false);
            onClose();
        }
    };

    const handleCloseModal = (open: boolean) => {
        if (!open) {
            setShowRejectionCard(false);
            setRejectionReason('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="w-auto h-auto !max-w-[95vw] max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Detail Pendaftaran - {pendaftarData.nama}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Biodata Diri dan Sertifikasi */}
                    <div className="flex-shrink-0">
                        <div className="space-y-6">
                            {/* Biodata Diri */}
                            <Card className="min-w-[500px]">
                                <CardHeader>
                                    <CardTitle>Biodata Diri</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Nama Peserta
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.biodata.nama}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Tempat/Tanggal Lahir
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.biodata.tempatTanggalLahir}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Alamat
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.biodata.alamat}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Email
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.biodata.email}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                No. Telepon
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.biodata.noTelepon}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sertifikasi Kompetensi */}
                            <Card className="min-w-[500px]">
                                <CardHeader>
                                    <CardTitle>Sertifikasi Kompetensi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Nama Sertifikasi
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.sertifikasi.namaSertifikasi}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Jadwal Sertifikasi
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.sertifikasi.jadwalSertifikasi}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Batch
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.sertifikasi.batch}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                                Assessor
                                            </div>
                                            <p className="text-sm font-medium">
                                                {pendaftarData.sertifikasi.assessor}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Approval Section */}
                    <div className="flex-shrink-0">
                        <div className="space-y-4">
                            {pendaftarData.status === 'Pengajuan' && (
                                <Card className="min-w-[300px]">
                                    <CardHeader>
                                        <CardTitle className="text-base">Approval</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-3">
                                            <Button 
                                                onClick={handleApprove}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                Setujui
                                            </Button>
                                            <Button 
                                                onClick={handleReject}
                                                variant="destructive"
                                                className="w-full"
                                            >
                                                Tolak
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {showRejectionCard && (
                                <Card className="min-w-[300px]">
                                    <CardHeader>
                                        <CardTitle className="text-base">Alasan Penolakan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Masukkan alasan penolakan..."
                                                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={handleSubmitRejection}
                                                    variant="destructive"
                                                    className="flex-1"
                                                    disabled={!rejectionReason.trim()}
                                                >
                                                    Kirim
                                                </Button>
                                                <Button 
                                                    onClick={() => setShowRejectionCard(false)}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
