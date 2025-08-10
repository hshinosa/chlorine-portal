<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::latest()->paginate(10);

        return Inertia::render('admin/manajemen-video', [
            'videos' => $videos
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/form-video');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_video' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'video_url' => 'required|url',
            'durasi' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Publish',
            'uploader' => 'required|string|max:255',
            'featured' => 'boolean'
        ]);

        // Upload thumbnail
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('video/thumbnails', 'public');
        }

        $validated['featured'] = $request->boolean('featured');
        $validated['views'] = 0;

        Video::create($validated);

        return redirect()->route('admin.manajemen-video')
            ->with('success', 'Video berhasil dibuat');
    }

    public function show($id)
    {
        $video = Video::findOrFail($id);
        return response()->json($video);
    }

    public function edit($id)
    {
        $video = Video::findOrFail($id);

        return Inertia::render('admin/form-video', [
            'video' => $video,
            'isEdit' => true
        ]);
    }

    public function update(Request $request, $id)
    {
        $video = Video::findOrFail($id);

        $validated = $request->validate([
            'nama_video' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'video_url' => 'required|url',
            'durasi' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Publish',
            'uploader' => 'required|string|max:255',
            'featured' => 'boolean'
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            if ($video->thumbnail) {
                Storage::disk('public')->delete($video->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('video/thumbnails', 'public');
        }

        $validated['featured'] = $request->boolean('featured');

        $video->update($validated);

        return redirect()->route('admin.manajemen-video')
            ->with('success', 'Video berhasil diperbarui');
    }

    public function destroy($id)
    {
        $video = Video::findOrFail($id);

        // Delete thumbnail
        if ($video->thumbnail) {
            Storage::disk('public')->delete($video->thumbnail);
        }

        $video->delete();

        return redirect()->route('admin.manajemen-video')
            ->with('success', 'Video berhasil dihapus');
    }

    // API Methods
    public function apiIndex(Request $request)
    {
        $query = Video::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_video', 'like', '%' . $search . '%')
                  ->orWhere('deskripsi', 'like', '%' . $search . '%')
                  ->orWhere('uploader', 'like', '%' . $search . '%');
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $videos = $query->paginate($request->get('per_page', 10));

        return response()->json($videos);
    }

    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'nama_video' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'video_url' => 'required|url',
            'durasi' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Publish',
            'uploader' => 'required|string|max:255',
            'featured' => 'boolean'
        ]);

        $validated['featured'] = $request->boolean('featured');
        $validated['views'] = 0;

        $video = Video::create($validated);

        return response()->json([
            'message' => 'Video berhasil dibuat',
            'data' => $video
        ], 201);
    }

    public function apiUpdate(Request $request, $id)
    {
        $video = Video::findOrFail($id);

        $validated = $request->validate([
            'nama_video' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'video_url' => 'required|url',
            'durasi' => 'required|integer|min:1',
            'status' => 'required|in:Draf,Publish',
            'uploader' => 'required|string|max:255',
            'featured' => 'boolean'
        ]);

        $validated['featured'] = $request->boolean('featured');

        $video->update($validated);

        return response()->json([
            'message' => 'Video berhasil diperbarui',
            'data' => $video
        ]);
    }

    public function apiDestroy($id)
    {
        $video = Video::findOrFail($id);
        
        if ($video->thumbnail) {
            Storage::disk('public')->delete($video->thumbnail);
        }
        
        $video->delete();

        return response()->json([
            'message' => 'Video berhasil dihapus'
        ]);
    }
}
