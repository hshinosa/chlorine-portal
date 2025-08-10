import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { pklService } from '@/services/pklService';
import { useToast } from '@/components/ui/toast';

interface ApplyPKLProps { positionId?: string; }

export default function ApplyPKL({ positionId }: ApplyPKLProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const pid = Number(positionId);

  // Collected form data across steps
  const [data, setData] = useState<any>({
    cv: null,
    portfolio: '',
    pendidikan: { institusi: '', jurusan: '', semester: '', ipk: '' },
    skills: '',
    minat: '',
    agree: false
  });

  const next = () => setStep(s => Math.min(4, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await pklService.applyPKL(pid, data); // Expect backend to parse multi-step payload
      toast({ type: 'success', title: 'Terkirim', message: 'Pendaftaran PKL berhasil dikirim' });
      router.visit('/user/dashboard');
    } catch (e:any){
      toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal mengirim pendaftaran' });
    } finally { setLoading(false); }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/user/dashboard'}, { title: 'Daftar PKL', href: '#'}]}>
      <Head title="Pendaftaran PKL" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Pendaftaran PKL</h1>
          <div className="text-sm text-muted-foreground">Langkah {step} dari 4</div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Langkah {step}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Data Diri & CV</p>
                <input type="file" onChange={e=>setData({...data, cv: e.target.files?.[0]})} />
                <input placeholder="Link Portofolio" className="border rounded px-3 py-2 text-sm w-full" value={data.portfolio} onChange={e=>setData({...data, portfolio: e.target.value})} />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Pendidikan</p>
                <input placeholder="Institusi" className="border rounded px-3 py-2 text-sm w-full" value={data.pendidikan.institusi} onChange={e=>setData({...data, pendidikan:{...data.pendidikan, institusi: e.target.value}})} />
                <input placeholder="Jurusan" className="border rounded px-3 py-2 text-sm w-full" value={data.pendidikan.jurusan} onChange={e=>setData({...data, pendidikan:{...data.pendidikan, jurusan: e.target.value}})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Semester" className="border rounded px-3 py-2 text-sm w-full" value={data.pendidikan.semester} onChange={e=>setData({...data, pendidikan:{...data.pendidikan, semester: e.target.value}})} />
                  <input placeholder="IPK" className="border rounded px-3 py-2 text-sm w-full" value={data.pendidikan.ipk} onChange={e=>setData({...data, pendidikan:{...data.pendidikan, ipk: e.target.value}})} />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Skill & Minat</p>
                <textarea placeholder="Skill" className="border rounded px-3 py-2 text-sm w-full" value={data.skills} onChange={e=>setData({...data, skills: e.target.value})} />
                <textarea placeholder="Minat" className="border rounded px-3 py-2 text-sm w-full" value={data.minat} onChange={e=>setData({...data, minat: e.target.value})} />
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Konfirmasi & Kebijakan</p>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.agree} onChange={e=>setData({...data, agree: e.target.checked})} /> Saya menyetujui syarat & ketentuan.</label>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" disabled={step===1} onClick={prev}>Kembali</Button>
              {step < 4 ? (
                <Button onClick={next}>Lanjut</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Pendaftaran'}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
