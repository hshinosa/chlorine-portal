<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendaftaranSertifikasi extends Model
{
    use HasFactory;

    protected $table = 'pendaftaran_sertifikasi';

    protected $fillable = [
        'user_id',
        'sertifikasi_id',
        'batch_id',
        'status',
        'tanggal_pendaftaran',
        'catatan_admin',
        'berkas_persyaratan'
    ];

    protected $casts = [
        'tanggal_pendaftaran' => 'date',
        'berkas_persyaratan' => 'array'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sertifikasi()
    {
        return $this->belongsTo(Sertifikasi::class);
    }

    public function batch()
    {
        return $this->belongsTo(BatchSertifikasi::class, 'batch_id');
    }

    public function penilaian()
    {
        return $this->hasOne(PenilaianSertifikasi::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'Pengajuan');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'Disetujui');
    }
}
