<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PKL extends Model
{
    use HasFactory;

    protected $table = 'pkl';

    protected $fillable = [
        'nama_program',
        'deskripsi',
        'durasi_minggu',
        'kuota',
        'peserta_terdaftar',
        'status',
        'persyaratan',
        'benefit'
    ];

    protected $casts = [
        'durasi_minggu' => 'integer',
        'kuota' => 'integer',
        'peserta_terdaftar' => 'integer',
        'persyaratan' => 'array',
        'benefit' => 'array'
    ];

    // Relationships
    public function pendaftaran()
    {
        return $this->hasMany(PendaftaranPKL::class, 'pkl_id');
    }

    public function penilaian()
    {
        return $this->hasMany(PenilaianPKL::class, 'pkl_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeAvailable($query)
    {
        return $query->whereRaw('peserta_terdaftar < kuota');
    }

    // Accessors
    public function getIsFullAttribute()
    {
        return $this->peserta_terdaftar >= $this->kuota;
    }

    public function getSisaKuotaAttribute()
    {
        return $this->kuota - $this->peserta_terdaftar;
    }
}
