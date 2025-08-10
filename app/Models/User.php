<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'birth_date',
        'birth_place',
        'institution',
        'major',
        'semester',
        'gpa',
        'role',
        'avatar'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'semester' => 'integer',
            'gpa' => 'decimal:2',
        ];
    }

    // Relationships
    public function pendaftaranSertifikasi()
    {
        return $this->hasMany(PendaftaranSertifikasi::class);
    }

    public function pendaftaranPKL()
    {
        return $this->hasMany(PendaftaranPKL::class);
    }

    public function penilaianSertifikasiAsAsesor()
    {
        return $this->hasMany(PenilaianSertifikasi::class, 'asesor_id');
    }

    public function penilaianPKLAsPembimbing()
    {
        return $this->hasMany(PenilaianPKL::class, 'pembimbing_id');
    }

    public function sertifikasiCreated()
    {
        return $this->hasMany(Sertifikasi::class, 'created_by');
    }

    public function sertifikasiUpdated()
    {
        return $this->hasMany(Sertifikasi::class, 'updated_by');
    }

    // Scopes
    public function scopeAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeUser($query)
    {
        return $query->where('role', 'user');
    }

    public function scopeAsesor($query)
    {
        return $query->where('role', 'asesor');
    }

    // Accessors
    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
    }

    public function getFullNameAttribute()
    {
        return $this->name;
    }

    // Methods
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }

    public function isAsesor()
    {
        return $this->role === 'asesor';
    }
}
