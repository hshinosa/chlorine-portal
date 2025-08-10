<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Video;
use App\Http\Resources\VideoResource;

class VideoController extends Controller
{
    /**
     * Display a listing of videos.
     */
    public function index(Request $request)
    {
        try {
            $query = Video::query();

            // Filter by status (for public, only show published)
            if (auth()->check() && auth()->user()->role === 'admin') {
                // Admin can see all statuses
                if ($request->has('status') && $request->status !== 'all') {
                    $query->where('status', $request->status);
                }
            } else {
                // Public users only see published content
                $query->where('status', 'Publish');
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('nama_video', 'like', '%' . $request->search . '%')
                      ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                      ->orWhere('uploader', 'like', '%' . $request->search . '%');
                });
            }

            // Featured content first, then by creation date
            $query->orderBy('featured', 'desc')
                  ->orderBy('created_at', 'desc');

            $videos = $query->paginate(12);

            return response()->json([
                'success' => true,
                'data' => VideoResource::collection($videos)->response()->getData()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve videos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified video.
     */
    public function show($id)
    {
        try {
            $query = Video::where('id', $id);

            // Only show published content for non-admin users
            if (!auth()->check() || auth()->user()->role !== 'admin') {
                $query->where('status', 'Publish');
            }

            $video = $query->firstOrFail();

            // Increment view count
            $video->increment('views');

            return response()->json([
                'success' => true,
                'data' => new VideoResource($video)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Video not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created video (Admin only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_video' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'video_url' => 'required|url',
            'durasi' => 'required|integer|min:1',
            'uploader' => 'required|string|max:255',
            'featured' => 'boolean',
            'status' => 'in:Draft,Publish,Archived'
        ]);

        try {
            $video = Video::create([
                'nama_video' => $request->nama_video,
                'deskripsi' => $request->deskripsi,
                'video_url' => $request->video_url,
                'durasi' => $request->durasi,
                'uploader' => $request->uploader,
                'featured' => $request->featured ?? false,
                'status' => $request->status ?? 'Draft',
                'views' => 0
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Video created successfully',
                'data' => new VideoResource($video)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create video',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified video (Admin only).
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_video' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'video_url' => 'required|url',
            'durasi' => 'required|integer|min:1',
            'uploader' => 'required|string|max:255',
            'featured' => 'boolean',
            'status' => 'in:Draft,Publish,Archived'
        ]);

        try {
            $video = Video::findOrFail($id);

            $video->update([
                'nama_video' => $request->nama_video,
                'deskripsi' => $request->deskripsi,
                'video_url' => $request->video_url,
                'durasi' => $request->durasi,
                'uploader' => $request->uploader,
                'featured' => $request->featured ?? false,
                'status' => $request->status ?? $video->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Video updated successfully',
                'data' => new VideoResource($video)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update video',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified video (Admin only).
     */
    public function destroy($id)
    {
        try {
            $video = Video::findOrFail($id);
            $video->delete();

            return response()->json([
                'success' => true,
                'message' => 'Video deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete video',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured videos.
     */
    public function featured()
    {
        try {
            $videos = Video::where('status', 'Publish')
                          ->where('featured', true)
                          ->orderBy('created_at', 'desc')
                          ->limit(6)
                          ->get();

            return response()->json([
                'success' => true,
                'data' => VideoResource::collection($videos)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured videos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular videos (most viewed).
     */
    public function popular()
    {
        try {
            $videos = Video::where('status', 'Publish')
                          ->orderBy('views', 'desc')
                          ->limit(6)
                          ->get();

            return response()->json([
                'success' => true,
                'data' => VideoResource::collection($videos)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve popular videos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle video featured status (Admin only).
     */
    public function toggleFeatured($id)
    {
        try {
            $video = Video::findOrFail($id);
            $video->update(['featured' => !$video->featured]);

            return response()->json([
                'success' => true,
                'message' => 'Video featured status updated',
                'data' => new VideoResource($video)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle featured status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
