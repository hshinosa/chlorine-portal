import { Head } from '@inertiajs/react';
import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, MoreVertical, Video, Eye, Calendar, User, Play, Loader2, ImageOff, Check } from 'lucide-react';
import { videoService } from '@/services/videoService';
import { useToast } from '@/components/ui/toast';
import { type Video as VideoType } from '@/types/api';
import { ListSkeleton } from '@/components/ui/skeletons';

// NOTE: Backend Video fields (see types/api.ts):
// id, nama_video, deskripsi, thumbnail, video_url, durasi, views, featured, status, uploader, created_at, updated_at

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Konten', href: '#' },
    { title: 'Video', href: '/admin/manajemen-video' }
];

export default function ManajemenVideo() {
    // State management
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingVideo, setDeletingVideo] = useState<VideoType | null>(null);
    const [showVideoPreview, setShowVideoPreview] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [previewingVideo, setPreviewingVideo] = useState<VideoType | null>(null);
    const [thumbnailPreviews, setThumbnailPreviews] = useState<Record<number, string>>({});
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Form data aligned with backend fields
    const [formData, setFormData] = useState<{ 
        nama_video: string; 
        deskripsi: string; 
        video_url: string; 
        status: string; 
        uploader: string; 
        featured: boolean; 
        durasi?: number; 
        thumbnail?: File | null; 
    }>({
        nama_video: '',
        deskripsi: '',
        video_url: '',
        status: 'draft',
        uploader: 'Admin',
        featured: false,
        durasi: undefined,
        thumbnail: null
    });

    // Reset page when search changes
    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const isDirtyRef = useRef(false);

    useUnsavedChanges(isDirtyRef.current);

    // Mark dirty when form changes
    useEffect(() => { if (showFormModal) isDirtyRef.current = true; }, [formData, showFormModal]);

    // Reset dirty flag on close/save
    const resetDirty = () => { isDirtyRef.current = false; };

    // Fetch videos whenever page or filters change
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const filters: any = {};
                if (searchQuery) filters.search = searchQuery;
                if (statusFilter) filters.status = statusFilter;
                const data = await videoService.getVideos(currentPage, filters);
                setVideos(data.data);
                setLastPage(data.last_page);
                setTotalItems(data.total);
            } catch (e: any) {
                setError(e.message || 'Gagal memuat data video');
                toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal memuat data video' });
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [currentPage, searchQuery, statusFilter]);

    // Preload YouTube thumbnails for video content
    useEffect(() => {
        const loadThumbnails = async () => {
            const thumbnails: Record<number, string> = {};
            for (const item of videos) {
                if (item.video_url && isValidYouTubeUrl(item.video_url)) {
                    const thumbnailUrl = getYouTubeThumbnail(item.video_url);
                    if (thumbnailUrl) {
                        try {
                            const response = await fetch(thumbnailUrl);
                            if (response.ok) thumbnails[item.id] = thumbnailUrl; else {
                                const fallbackUrl = `https://img.youtube.com/vi/${extractYouTubeVideoId(item.video_url)}/hqdefault.jpg`;
                                thumbnails[item.id] = fallbackUrl;
                            }
                        } catch {
                            const fallbackUrl = `https://img.youtube.com/vi/${extractYouTubeVideoId(item.video_url)}/hqdefault.jpg`;
                            thumbnails[item.id] = fallbackUrl;
                        }
                    }
                }
            }
            setThumbnailPreviews(thumbnails);
        };
        loadThumbnails();
    }, [videos]);

    // Calculate statistics
    const totalVideo = totalItems;
    const videoPublish = videos.filter(item => item.status === 'published').length; // local page counts
    const videoDraf = videos.filter(item => item.status === 'draft').length;

    // Filter data berdasarkan search
    // Client-side filtering already handled via API params; we keep videos as current page data
    const paginatedData = videos;

    // Handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (_items: number) => {
        // API driven pagination with fixed backend per_page; could extend by passing per_page param if backend supports
    };

    // YouTube helper functions
    const extractYouTubeVideoId = (url: string): string | null => {
        if (!url) return null;
        
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    };

    const isValidYouTubeUrl = (url: string): boolean => {
        return extractYouTubeVideoId(url) !== null;
    };

    const getYouTubeEmbedUrl = (url: string): string | null => {
        const videoId = extractYouTubeVideoId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const getYouTubeThumbnail = (url: string): string | null => {
        const videoId = extractYouTubeVideoId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    };

    const handleAddVideo = () => {
        setEditingVideo(null);
        setFormData({
            nama_video: '',
            deskripsi: '',
            video_url: '',
            status: 'draft',
            uploader: 'Admin',
            featured: false,
            durasi: undefined,
            thumbnail: null
        });
        setShowVideoPreview(false);
        setShowFormModal(true);
    };

    const handleEditVideo = (video: VideoType) => {
        setEditingVideo(video);
        setFormData({
            nama_video: video.nama_video,
            deskripsi: video.deskripsi,
            video_url: video.video_url,
            status: video.status,
            uploader: video.uploader,
            featured: video.featured,
            durasi: video.durasi,
            thumbnail: null
        });
        setShowVideoPreview(isValidYouTubeUrl(video.video_url));
        setShowFormModal(true);
    };

    const handleDeleteVideo = (video: VideoType) => {
        setDeletingVideo(video);
        setShowDeleteModal(true);
    };

    const handleFormSave = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const payload: any = {
                nama_video: formData.nama_video,
                deskripsi: formData.deskripsi,
                video_url: formData.video_url,
                status: formData.status,
                uploader: formData.uploader,
                featured: formData.featured,
                durasi: formData.durasi
            };
            if (formData.thumbnail) payload.thumbnail_file = formData.thumbnail;
            if (editingVideo) {
                const updated = await videoService.updateVideo(editingVideo.id, payload);
                setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
                toast({ type: 'success', title: 'Tersimpan', message: 'Video berhasil diperbarui' });
            } else {
                const created = await videoService.createVideo(payload);
                setVideos(prev => [created, ...prev]);
                toast({ type: 'success', title: 'Tersimpan', message: 'Video berhasil dibuat' });
            }
            setShowFormModal(false);
            setEditingVideo(null);
            resetDirty();
        } catch (e: any) {
            setError(e.message || 'Gagal menyimpan video');
            toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal menyimpan video' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingVideo) return;
        setSubmitting(true);
        setError(null);
        try {
            await videoService.deleteVideo(deletingVideo.id);
            setVideos(prev => prev.filter(v => v.id !== deletingVideo.id));
            setShowDeleteModal(false);
            setDeletingVideo(null);
            toast({ type: 'success', title: 'Dihapus', message: 'Video berhasil dihapus' });
        } catch (e: any) {
            setError(e.message || 'Gagal menghapus video');
            toast({ type: 'error', title: 'Gagal', message: e.message || 'Gagal menghapus video' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleVideoLinkChange = (url: string) => {
        setFormData({ ...formData, video_url: url });
        setShowVideoPreview(isValidYouTubeUrl(url));
    };

    const handlePreviewVideo = (video: VideoType) => {
        setPreviewingVideo(video);
        setShowVideoModal(true);
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'published':
                return 'default';
            case 'draft':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Video" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manajemen Video</h1>
                        <p className="text-muted-foreground font-serif">
                            Kelola video konten untuk platform
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleAddVideo} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Video
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Video className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalVideo}</div>
                                    <p className="text-sm text-muted-foreground">Total Video</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Eye className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{videoPublish}</div>
                                    <p className="text-sm text-muted-foreground">Video Publish</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Video className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{videoDraf}</div>
                                    <p className="text-sm text-muted-foreground">Video Draf</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Video</CardTitle>
                            <div className="flex items-center gap-2">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Cari video..."
                                    className="w-64"
                                />
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                {error}
                            </div>
                        )}
                        {loading && (<ListSkeleton className="mb-4" rows={4} />)}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Preview</TableHead>
                                    <TableHead>Nama Video</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead>Penulis</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[120px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!loading && paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {thumbnailPreviews[item.id] ? (
                                                        <div className="relative w-full h-full group cursor-pointer" onClick={() => handlePreviewVideo(item)}>
                                                            <img
                                                                src={thumbnailPreviews[item.id]}
                                                                alt={`Thumbnail ${item.nama_video}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback to a generic video icon if thumbnail fails to load
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                            <div className="hidden absolute inset-0 bg-gray-200 flex items-center justify-center">
                                                                <Video className="h-4 w-4 text-gray-500" />
                                                            </div>
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                                                <Play className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Video className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold flex items-center gap-2">
                                                        <Play className="h-4 w-4 text-red-500" />
                                                        {item.nama_video}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                        {item.deskripsi}
                                                    </div>
                                                    {item.video_url && isValidYouTubeUrl(item.video_url) && (
                                                        <div className="mt-2">
                                                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md">
                                                                <Play className="h-3 w-3" />
                                                                Video YouTube tersedia
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <User className="h-3 w-3" />
                                                    {item.uploader}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {item.video_url && isValidYouTubeUrl(item.video_url) && (
                                                            <DropdownMenuItem onClick={() => handlePreviewVideo(item)}>
                                                                <Play className="mr-2 h-4 w-4" />
                                                                Preview Video
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleEditVideo(item)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteVideo(item)}
                                                            variant="destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <ImageOff className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-sm">
                                                    {searchQuery ? 'Tidak ada video sesuai pencarian.' : 'Belum ada video.'}
                                                </p>
                                                {!searchQuery && (
                                                    <Button size="sm" onClick={handleAddVideo}>
                                                        <Plus className="h-4 w-4 mr-1" /> Tambah Video
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="border-t">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={lastPage}
                                itemsPerPage={0}
                                totalItems={totalItems}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    )}
                </Card>

                {/* Form Modal */}
                <Dialog open={showFormModal} onOpenChange={(o)=>{ if(!o && isDirtyRef.current){ if(!confirm('Perubahan belum disimpan, tutup?')) return; } setShowFormModal(o); if(!o) resetDirty(); }}>
                    <DialogContent className="max-w-5xl min-w-[300px] md:min-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingVideo ? 'Edit Video' : 'Tambah Video Baru'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_video">Nama Video</Label>
                                <Input
                                    id="nama_video"
                                    value={formData.nama_video}
                                    onChange={(e) => setFormData({ ...formData, nama_video: e.target.value })}
                                    placeholder="Masukkan judul video"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Deskripsi singkat video"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="video_url">Link Video</Label>
                                    <Input
                                        id="video_url"
                                        value={formData.video_url}
                                        onChange={(e) => handleVideoLinkChange(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        type="url"
                                    />
                                    {formData.video_url && !isValidYouTubeUrl(formData.video_url) && (
                                        <p className="text-sm text-red-500">
                                            Link YouTube tidak valid. Pastikan format: https://youtube.com/watch?v=... atau https://youtu.be/...
                                        </p>
                                    )}
                                </div>
                                
                                {/* YouTube Video Preview */}
                                {showVideoPreview && formData.video_url && (
                                    <div className="space-y-2">
                                        <Label>Preview Video</Label>
                                        <div className="border rounded-lg overflow-hidden bg-gray-50">
                                            {/* Thumbnail Preview */}
                                            <div className="aspect-video relative bg-gray-100">
                                                {getYouTubeThumbnail(formData.video_url) && (
                                                    <img
                                                        src={getYouTubeThumbnail(formData.video_url) || ''}
                                                        alt="YouTube Thumbnail"
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Hide thumbnail if it fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <iframe
                                                    src={getYouTubeEmbedUrl(formData.video_url) || ''}
                                                    title="YouTube video preview"
                                                    className="w-full h-full relative z-10"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                            <div className="p-3 bg-white border-t">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Play className="h-4 w-4 text-red-500" />
                                                    <span>Video YouTube berhasil dimuat</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail">Thumbnail</Label>
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="uploader">Uploader</Label>
                                <Input
                                    id="uploader"
                                    value={formData.uploader}
                                    onChange={(e) => setFormData({ ...formData, uploader: e.target.value })}
                                    placeholder="Nama penulis"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowFormModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleFormSave} disabled={submitting}>
                                {submitting ? (
                                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</span>
                                ) : editingVideo ? 'Simpan Perubahan' : 'Tambah Video'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Apakah Anda yakin ingin menghapus video <strong>{deletingVideo?.nama_video}</strong>?</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Video Preview Modal */}
                <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-red-500" />
                                Preview Video: {previewingVideo?.nama_video}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            {previewingVideo && previewingVideo.video_url && (
                                <div className="space-y-4">
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <iframe
                                            src={getYouTubeEmbedUrl(previewingVideo.video_url) || ''}
                                            title={previewingVideo.nama_video}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">{previewingVideo.nama_video}</h3>
                                        <p className="text-muted-foreground">{previewingVideo.deskripsi}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {previewingVideo.uploader}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(previewingVideo.created_at).toLocaleDateString('id-ID')}
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(previewingVideo.status)}>
                                                {previewingVideo.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowVideoModal(false)}>
                                Tutup
                            </Button>
                            <Button onClick={() => {
                                setShowVideoModal(false);
                                if (previewingVideo) {
                                    handleEditVideo(previewingVideo);
                                }
                            }}>
                                Edit Video
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
