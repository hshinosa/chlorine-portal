import api from '../lib/api';
import type { ApiResponse } from '../types/api';

export interface DashboardStats {
  total_users: number;
  total_sertifikasi: number;
  total_pkl: number;
  total_blog_articles: number;
  total_videos: number;
  recent_registrations: number;
  pending_applications: number;
  active_sertifikasi: number;
  active_pkl: number;
  monthly_registrations: number[];
  popular_sertifikasi: any[];
  recent_activities: any[];
}

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/api/v1/admin/dashboard');
    return response.data.data;
  },

  // Get chart data for analytics
  async getChartData(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/api/v1/admin/chart-data');
    return response.data.data;
  },

  // Get all users (admin only)
  async getUsers(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/api/v1/admin/users');
    return response.data.data;
  },

  // Get certifications overview
  async getCertifications(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/api/v1/admin/certifications');
    return response.data.data;
  },

  // Get content overview
  async getContent(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/api/v1/admin/content');
    return response.data.data;
  },

  // Get reports data
  async getReports(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/api/v1/admin/reports');
    return response.data.data;
  },

  // Export data
  async exportData(type: 'users' | 'sertifikasi' | 'pkl' | 'blog', format: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    const response = await api.get(`/api/v1/admin/export/${type}?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Utility: Download exported file
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
