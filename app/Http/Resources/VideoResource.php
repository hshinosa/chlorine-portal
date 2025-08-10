<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
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
            'nama_video' => $this->nama_video,
            'deskripsi' => $this->deskripsi,
            'thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'video_url' => $this->video_url,
            'durasi' => $this->durasi,
            'views' => $this->views,
            'featured' => $this->featured,
            'status' => $this->status,
            'uploader' => $this->uploader,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
