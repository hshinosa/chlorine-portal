import api from '../lib/api';
import type { 
  PosisiPKL, 
  PKLFilters, 
  ApiResponse, 
  PaginatedResponse 
} from '../types/api';

export const pklService = {
  // Get all PKL positions with pagination and filters
  async getPKLPositions(page: number = 1, filters: PKLFilters = {}): Promise<PaginatedResponse<PosisiPKL>> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });
    
    const response = await api.get<ApiResponse<PaginatedResponse<PosisiPKL>>>(`/api/v1/pkl?${params}`);
    return response.data.data;
  },

  // Get single PKL position by ID
  async getPKLPosition(id: number): Promise<PosisiPKL> {
    const response = await api.get<ApiResponse<PosisiPKL>>(`/api/v1/pkl/${id}`);
    return response.data.data;
  },

  // User: Get my PKL applications
  async getMyApplications(): Promise<any[]> {
  // backend exposes /my-registrations (align naming with sertifikasi)
  const response = await api.get<ApiResponse<any[]>>('/api/v1/pkl/my-registrations');
    return response.data.data;
  },

  // User: Apply for PKL position
  async applyPKL(positionId: number, data: any): Promise<any> {
  const response = await api.post<ApiResponse<any>>(`/api/v1/pkl/${positionId}/register`, data);
  return response.data.data;
  },

  // User: Cancel application
  async cancelApplication(applicationId: number): Promise<void> {
  await api.delete(`/api/v1/pkl/registrations/${applicationId}/cancel`);
  },

  // Admin: Create PKL position
  async createPKLPosition(data: Partial<PosisiPKL>): Promise<PosisiPKL> {
    const response = await api.post<ApiResponse<PosisiPKL>>('/api/v1/admin/pkl', data);
    return response.data.data;
  },

  // Admin: Update PKL position
  async updatePKLPosition(id: number, data: Partial<PosisiPKL>): Promise<PosisiPKL> {
    const response = await api.put<ApiResponse<PosisiPKL>>(`/api/v1/admin/pkl/${id}`, data);
    return response.data.data;
  },

  // Admin: Delete PKL position
  async deletePKLPosition(id: number): Promise<void> {
    await api.delete(`/api/v1/admin/pkl/${id}`);
  },

  // Admin: Get all applications
  async getAllApplications(positionId?: number): Promise<any[]> {
  if (!positionId) throw new Error('positionId required to list PKL registrations (admin)');
  const response = await api.get<ApiResponse<any>>(`/api/v1/admin/pkl/${positionId}/registrations`);
  return response.data.data;
  },

  // Admin: Update application status
  async updateApplicationStatus(applicationId: number, status: string, data?: any): Promise<any> {
  const response = await api.patch<ApiResponse<any>>(`/api/v1/admin/pkl/registrations/${applicationId}/status`, { status, ...data });
  return response.data.data;
  },
  // Admin: Issue certificate for a PKL application
  async issueCertificate(applicationId: number): Promise<any> {
  const response = await api.post<ApiResponse<any>>(`/api/v1/admin/pkl/registrations/${applicationId}/issue-certificate`);
  return response.data.data;
  },

  // Utility: Format salary
  formatSalary(amount?: number): string {
    if (!amount) return 'Tidak disebutkan';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  // Utility: Get status badge color
  getStatusColor(status: string): string {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-800';
      case 'Non-Aktif': return 'bg-gray-100 text-gray-800';
      case 'Penuh': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Utility: Get type badge color
  getTypeColor(type: string): string {
    switch (type) {
      case 'Full-time': return 'bg-blue-100 text-blue-800';
      case 'Part-time': return 'bg-purple-100 text-purple-800';
      case 'Remote': return 'bg-green-100 text-green-800';
      case 'Hybrid': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
};
