import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { pklService } from '@/services/pklService';
import type { PosisiPKL } from '@/types/api';
import { ArrowLeft, Briefcase, MapPin, Clock, Users, Building2, Calendar, Loader2 } from 'lucide-react';
import { DetailSkeleton } from '@/components/ui/skeletons';
import { useToast } from '@/components/ui/toast';

interface DetailPKLProps { id?: string; }

export default function DetailPKL({ id }: DetailPKLProps) {
  const [data, setData] = useState<PosisiPKL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const { toast } = useToast();

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Praktik Kerja Lapangan', href: '/admin/praktik-kerja-lapangan' },
    { title: 'Detail PKL', href: '#' }
  ];

  useEffect(()=>{
    const load = async () => {
      if(!id) return;
      try {
        setLoading(true); setError(null);
        const res = await pklService.getPKLPosition(Number(id));
        setData(res);
      } catch(e:any){
        setError(e.message || 'Gagal memuat detail');
        toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal memuat detail PKL' });
      } finally { setLoading(false); }
    };
    load();
  },[id]);

  if(loading){
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Memuat Detail PKL" />
        <div className="p-6">
          <DetailSkeleton blocks={3} />
        </div>
      </AppLayout>
    );
  }
  if(error || !data){
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Gagal Memuat" />
        <div className="p-8 text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" onClick={()=>window.location.reload()}>Coba Lagi</Button>
        </div>
      </AppLayout>
    );
  }

  const duration = `${data.durasi_bulan} bulan`;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Detail PKL - ${data.nama_posisi}`} />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/praktik-kerja-lapangan">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{data.nama_posisi}</h1>
              <p className="text-muted-foreground">Detail posisi PKL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={data.status === 'Aktif' ? 'default' : data.status === 'Penuh' ? 'destructive' : 'secondary'}>{data.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Umum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Perusahaan</p>
                      <p className="font-medium">{data.perusahaan}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lokasi</p>
                      <p className="font-medium">{data.lokasi}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Durasi</p>
                      <p className="font-medium">{duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kuota</p>
                      <p className="font-medium">{data.kuota} Orang</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Deskripsi</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{data.deskripsi}</p>
                </div>

                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Persyaratan</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{data.persyaratan}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Periode & Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Periode</span><span>{data.tanggal_mulai} - {data.tanggal_selesai}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span>{data.contact_person}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{data.contact_email}</span></div>
                {data.contact_phone && <div className="flex justify-between"><span className="text-muted-foreground">Telepon</span><span>{data.contact_phone}</span></div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status Sistem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Dibuat</span><span>{new Date(data.created_at).toLocaleDateString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Diperbarui</span><span>{new Date(data.updated_at).toLocaleDateString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pendaftar</span><span>{data.jumlah_pendaftar} orang</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
