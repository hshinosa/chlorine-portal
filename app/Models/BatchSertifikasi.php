<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchSertifikasi extends Model
{
    use HasFactory;

    protected $table = 'batch_sertifikasi';

    protected $fillable = [
        'sertifikasi_id',
        'nama_batch',
        'tanggal_mulai',
        'tanggal_selesai',
        'jam_mulai',
        'jam_selesai',
        'tempat',
        'kuota',
        'jumlah_pendaftar',
        'status',
        'instruktur',
        'catatan'
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'jam_mulai' => 'datetime:H:i',
        'jam_selesai' => 'datetime:H:i',
        'kuota' => 'integer',
        'jumlah_pendaftar' => 'integer'
    ];

    // Relationships
    public function sertifikasi()
    {
        return $this->belongsTo(Sertifikasi::class);
    }

    public function pendaftaran()
    {
        return $this->hasMany(PendaftaranSertifikasi::class, 'batch_id');
    }

    public function penilaian()
    {
        return $this->hasMany(PenilaianSertifikasi::class, 'batch_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeAvailable($query)
    {
        return $query->whereRaw('jumlah_pendaftar < kuota');
    }

    // Accessors
    public function getIsFullAttribute()
    {
        return $this->jumlah_pendaftar >= $this->kuota;
    }

    public function getSisaKuotaAttribute()
    {
        return $this->kuota - $this->jumlah_pendaftar;
    }
}
