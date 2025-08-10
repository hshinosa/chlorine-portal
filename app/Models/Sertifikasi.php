<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sertifikasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sertifikasi';

    protected $fillable = [
        'nama_sertifikasi',
        'jenis_sertifikasi',
        'deskripsi',
        'thumbnail',
        'nama_asesor',
        'jabatan_asesor',
        'instansi_asesor',
        'pengalaman_asesor',
        'foto_asesor',
        'tipe_sertifikat',
        'kapasitas_peserta',
        'status',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'kapasitas_peserta' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relationships
    public function modul()
    {
        return $this->hasMany(ModulSertifikasi::class);
    }

    public function batch()
    {
        return $this->hasMany(BatchSertifikasi::class);
    }

    public function pendaftaran()
    {
        return $this->hasMany(PendaftaranSertifikasi::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeByJenis($query, $jenis)
    {
        return $query->where('jenis_sertifikasi', $jenis);
    }

    // Accessors & Mutators
    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail ? asset('storage/' . $this->thumbnail) : null;
    }

    public function getFotoAsesorUrlAttribute()
    {
        return $this->foto_asesor ? asset('storage/' . $this->foto_asesor) : null;
    }
}
