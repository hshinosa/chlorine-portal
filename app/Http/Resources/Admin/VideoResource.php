<?php

namespace App\Http\Resources\Admin;

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
            'judul' => $this->judul,
            'slug' => $this->slug,
            'deskripsi' => $this->deskripsi,
            'excerpt' => $this->excerpt ?? $this->getExcerpt(),
            'thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'video_url' => $this->video_url,
            'video_file' => $this->video_file ? asset('storage/' . $this->video_file) : null,
            'video_type' => $this->video_type,
            'durasi' => $this->durasi,
            'kategori' => $this->kategori,
            'tags' => $this->tags ? explode(',', $this->tags) : [],
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->format('Y-m-d H:i:s'),
            'published_at_formatted' => $this->published_at?->format('d M Y H:i'),
            'views' => $this->views ?? 0,
            'likes' => $this->likes ?? 0,
            'author_id' => $this->author_id,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'created_at_human' => $this->created_at->diffForHumans(),
            'updated_at_human' => $this->updated_at->diffForHumans(),
            
            // Status computed
            'is_published' => $this->status === 'published',
            'is_draft' => $this->status === 'draft',
            'is_scheduled' => $this->status === 'scheduled',
            'is_youtube' => $this->video_type === 'youtube',
            'is_upload' => $this->video_type === 'upload',
            'is_external' => $this->video_type === 'external',
            'duration_formatted' => $this->getDurationFormatted(),
            'video_embed_url' => $this->getVideoEmbedUrl(),
            
            // Relationships
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                    'email' => $this->author->email,
                    'avatar_url' => $this->author->avatar_url,
                ];
            }),
        ];
    }

    /**
     * Get excerpt from description.
     */
    private function getExcerpt(): string
    {
        $text = strip_tags($this->deskripsi);
        return strlen($text) > 150 ? substr($text, 0, 150) . '...' : $text;
    }

    /**
     * Format duration (seconds to MM:SS or HH:MM:SS).
     */
    private function getDurationFormatted(): string
    {
        if (!$this->durasi) return '00:00';
        
        $hours = floor($this->durasi / 3600);
        $minutes = floor(($this->durasi % 3600) / 60);
        $seconds = $this->durasi % 60;
        
        if ($hours > 0) {
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        }
        
        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    /**
     * Get video embed URL for YouTube videos.
     */
    private function getVideoEmbedUrl(): ?string
    {
        if ($this->video_type !== 'youtube' || !$this->video_url) {
            return null;
        }

        // Extract video ID from YouTube URL
        preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $this->video_url, $matches);
        
        if (isset($matches[1])) {
            return 'https://www.youtube.com/embed/' . $matches[1];
        }

        return null;
    }
}
