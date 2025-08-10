<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'institution' => $this->institution,
            'major' => $this->major,
            'semester' => $this->semester,
            'gpa' => $this->gpa,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Computed fields
            'is_admin' => $this->role === 'admin',
            'is_asesor' => $this->role === 'asesor',
            'is_user' => $this->role === 'user',
            'full_profile_completed' => $this->institution && $this->major && $this->semester && $this->gpa,
        ];
    }
}
