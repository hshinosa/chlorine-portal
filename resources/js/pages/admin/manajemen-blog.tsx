import { Head } from '@inertiajs/react';
import { useState, ChangeEvent, useEffect } from 'react';
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
import RichTextEditor from '@/components/RichTextEditor';
import { Plus, Edit, Trash2, MoreVertical, FileText, Eye, Calendar, User, Loader2 } from 'lucide-react';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/api';

interface BlogData {
    id: number;
    nama_artikel: string;
    jenis_konten: string;
    deskripsi: string;
    konten: string;
    thumbnail?: string;
    slug: string;
    status: string;
    penulis: string;
    featured: boolean;
    views: number;
    meta_title?: string;
    meta_description?: string;
    excerpt: string;
    created_at: string;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Konten', href: '#' },
    { title: 'Blog', href: '/admin/manajemen-blog' }
];

export default function ManajemenBlog() {
    // State management
    const [blogData, setBlogData] = useState<BlogData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogData | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingBlog, setDeletingBlog] = useState<BlogData | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        nama_artikel: '',
        jenis_konten: 'Blog',
        deskripsi: '',
        konten: '',
        excerpt: '',
        thumbnail: '',
        status: 'draft',
        penulis: 'Admin Kompetensia',
        featured: false,
        meta_title: '',
        meta_description: ''
    });

    // Load blogs on component mount
    useEffect(() => {
        fetchBlogs();
    }, []);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Fetch blogs from API
    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await blogService.getBlogs();
            setBlogData(response.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            // Show error notification
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const totalBlog = blogData.length;
    const blogPublish = blogData.filter(item => item.status === 'published').length;
    const blogDraf = blogData.filter(item => item.status === 'draft').length;

    // Filter data berdasarkan search
    const filteredData = blogData.filter((item) =>
        item.nama_artikel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.penulis.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        // Implementation for items per page change
    };

    const handleAddBlog = () => {
        setEditingBlog(null);
        setFormData({
            nama_artikel: '',
            jenis_konten: 'Blog',
            deskripsi: '',
            konten: '',
            excerpt: '',
            thumbnail: '',
            status: 'draft',
            penulis: 'Admin Kompetensia',
            featured: false,
            meta_title: '',
            meta_description: ''
        });
        setShowFormModal(true);
    };

    const handleEditBlog = (blog: BlogData) => {
        setEditingBlog(blog);
        setFormData({
            nama_artikel: blog.nama_artikel,
            jenis_konten: blog.jenis_konten,
            deskripsi: blog.deskripsi,
            konten: blog.konten,
            excerpt: blog.excerpt,
            thumbnail: blog.thumbnail || '',
            status: blog.status,
            penulis: blog.penulis,
            featured: blog.featured,
            meta_title: blog.meta_title || '',
            meta_description: blog.meta_description || ''
        });
        setShowFormModal(true);
    };

    const handleDeleteBlog = (blog: BlogData) => {
        setDeletingBlog(blog);
        setShowDeleteModal(true);
    };

    const handleFormSave = async () => {
        try {
            setSubmitting(true);
            const currentDate = new Date().toISOString().split('T')[0];
            
            if (editingBlog) {
                // Update existing blog
                await blogService.updateBlog(editingBlog.id, formData);
                // Refresh blog list
                await fetchBlogs();
            } else {
                // Add new blog
                await blogService.createBlog(formData);
                // Refresh blog list
                await fetchBlogs();
            }
            setShowFormModal(false);
            setEditingBlog(null);
        } catch (error) {
            console.error('Error saving blog:', error);
            // Show error notification
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (deletingBlog) {
            try {
                setSubmitting(true);
                await blogService.deleteBlog(deletingBlog.id);
                // Refresh blog list
                await fetchBlogs();
                setShowDeleteModal(false);
                setDeletingBlog(null);
            } catch (error) {
                console.error('Error deleting blog:', error);
                // Show error notification
            } finally {
                setSubmitting(false);
            }
        }
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
            <Head title="Manajemen Blog" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manajemen Blog</h1>
                        <p className="text-muted-foreground font-serif">
                            Kelola artikel blog untuk platform
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleAddBlog} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah Artikel Blog
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalBlog}</div>
                                    <p className="text-sm text-muted-foreground">Total Artikel Blog</p>
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
                                    <div className="text-2xl font-bold">{blogPublish}</div>
                                    <p className="text-sm text-muted-foreground">Artikel Publish</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{blogDraf}</div>
                                    <p className="text-sm text-muted-foreground">Artikel Draf</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Artikel Blog</CardTitle>
                            <div className="flex items-center gap-2">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Cari artikel blog..."
                                    className="w-64"
                                />
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Memuat data blog...</span>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Artikel</TableHead>
                                        <TableHead>Dibuat</TableHead>
                                        <TableHead>Penulis</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[120px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div className="font-semibold flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-blue-500" />
                                                            {item.nama_artikel}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                            {item.deskripsi}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <User className="h-3 w-3" />
                                                        {item.penulis}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(item.status)}>
                                                        {item.status === 'published' ? 'Published' : 'Draft'}
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
                                                            <DropdownMenuItem onClick={() => handleEditBlog(item)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDeleteBlog(item)}
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
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                {searchQuery
                                                    ? 'Tidak ada data yang sesuai dengan pencarian'
                                                    : 'Tidak ada data artikel blog'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="border-t">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                totalItems={totalItems}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    )}
                </Card>

                {/* Form Modal */}
                <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
                    <DialogContent className="max-w-5xl min-w-[300px] md:min-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBlog ? 'Edit Artikel Blog' : 'Tambah Artikel Blog Baru'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_artikel">Nama Artikel</Label>
                                <Input
                                    id="nama_artikel"
                                    value={formData.nama_artikel}
                                    onChange={(e) => setFormData({ ...formData, nama_artikel: e.target.value })}
                                    placeholder="Masukkan judul artikel"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Deskripsi singkat artikel"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <RichTextEditor
                                    value={formData.konten}
                                    onChange={(content: string) => setFormData({ ...formData, konten: content })}
                                    placeholder="Tulis konten artikel di sini..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: string) => setFormData({ ...formData, status: value })}
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
                                <div className="space-y-2">
                                    <Label htmlFor="penulis">Penulis</Label>
                                    <Input
                                        id="penulis"
                                        value={formData.penulis}
                                        onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                                        placeholder="Nama penulis"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowFormModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleFormSave} disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingBlog ? 'Simpan Perubahan' : 'Tambah Artikel'}
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
                            <p>Apakah Anda yakin ingin menghapus artikel <strong>{deletingBlog?.nama_artikel}</strong>?</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
