import api from '../lib/api';
import type { 
  Video, 
  VideoFilters, 
  ApiResponse, 
  PaginatedResponse 
} from '../types/api';

export const videoService = {
  // Get all videos with pagination and filters
  async getVideos(page: number = 1, filters: VideoFilters = {}): Promise<PaginatedResponse<Video>> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });
    
    const response = await api.get<ApiResponse<PaginatedResponse<Video>>>(`/api/v1/video?${params}`);
    return response.data.data;
  },

  // Get single video by ID
  async getVideo(id: number): Promise<Video> {
    const response = await api.get<ApiResponse<Video>>(`/api/v1/video/${id}`);
    return response.data.data;
  },

  // Get featured videos
  async getFeaturedVideos(): Promise<Video[]> {
    const response = await api.get<ApiResponse<Video[]>>('/api/v1/video/featured');
    return response.data.data;
  },

  // Get popular videos
  async getPopularVideos(): Promise<Video[]> {
    const response = await api.get<ApiResponse<Video[]>>('/api/v1/video/popular');
    return response.data.data;
  },

  // Search videos
  async searchVideos(query: string): Promise<Video[]> {
    const response = await api.get<ApiResponse<Video[]>>(`/api/v1/video?search=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // Admin: Create video
  async createVideo(data: Partial<Video> & { thumbnail_file?: File }): Promise<Video> {
    // Detect file for multipart
    if (data.thumbnail_file) {
      const form = new FormData();
      Object.entries(data).forEach(([k,v]) => {
        if (v === undefined || v === null) return;
        if (k === 'thumbnail_file' && v instanceof File) form.append('thumbnail', v);
        else form.append(k, String(v));
      });
      const response = await api.post<ApiResponse<Video>>('/api/v1/admin/videos', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      return response.data.data;
    } else {
      const clone = { ...data } as any; delete clone.thumbnail_file;
      const response = await api.post<ApiResponse<Video>>('/api/v1/admin/videos', clone);
      return response.data.data;
    }
  },

  // Admin: Update video
  async updateVideo(id: number, data: Partial<Video> & { thumbnail_file?: File }): Promise<Video> {
    if (data.thumbnail_file) {
      const form = new FormData();
      form.append('_method', 'PUT');
      Object.entries(data).forEach(([k,v]) => {
        if (v === undefined || v === null) return;
        if (k === 'thumbnail_file' && v instanceof File) form.append('thumbnail', v);
        else if (k !== 'thumbnail_file') form.append(k, String(v));
      });
      const response = await api.post<ApiResponse<Video>>(`/api/v1/admin/videos/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      return response.data.data;
    } else {
      const clone = { ...data } as any; delete clone.thumbnail_file;
      const response = await api.put<ApiResponse<Video>>(`/api/v1/admin/videos/${id}`, clone);
      return response.data.data;
    }
  },

  // Admin: Delete video
  async deleteVideo(id: number): Promise<void> {
    await api.delete(`/api/v1/admin/videos/${id}`);
  },

  // Admin: Toggle featured status
  async toggleFeatured(id: number): Promise<Video> {
    const response = await api.post<ApiResponse<Video>>(`/api/v1/admin/videos/${id}/toggle-featured`);
    return response.data.data;
  },

  // Utility: Format duration (seconds to mm:ss)
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};
