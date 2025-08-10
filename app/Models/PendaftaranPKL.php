<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendaftaranPKL extends Model
{
    use HasFactory;

    protected $table = 'pendaftaran_pkl';

    protected $fillable = [
        'user_id',
        'pkl_id',
        'status',
        'tanggal_pendaftaran',
        'tanggal_mulai',
        'tanggal_selesai',
        'institusi_asal',
        'program_studi',
        'semester',
        'ipk',
        'catatan_admin',
        'berkas_persyaratan'
    ];

    protected $casts = [
        'tanggal_pendaftaran' => 'date',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'semester' => 'integer',
        'ipk' => 'decimal:2',
        'berkas_persyaratan' => 'array'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pkl()
    {
        return $this->belongsTo(PKL::class);
    }

    public function penilaian()
    {
        return $this->hasOne(PenilaianPKL::class);
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
