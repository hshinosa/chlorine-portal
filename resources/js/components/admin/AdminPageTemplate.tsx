import { useState, useEffect, ReactNode } from 'react';
import { Head } from '@inertiajs/react';
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
import { Plus, Edit, Trash2, MoreVertical, Loader2 } from 'lucide-react';

interface AdminPageTemplateProps<T> {
    title: string;
    pageTitle: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    data: T[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAdd: () => void;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    renderTableHeaders: () => ReactNode;
    renderTableRow: (item: T, index: number) => ReactNode;
    renderForm: () => ReactNode;
    renderDeleteConfirmation: () => ReactNode;
    showFormModal: boolean;
    showDeleteModal: boolean;
    onCloseFormModal: () => void;
    onCloseDeleteModal: () => void;
    onSave: () => void;
    submitting?: boolean;
    editingItem?: T | null;
    deletingItem?: T | null;
    statsCards?: Array<{
        title: string;
        value: number;
        icon: ReactNode;
        color: string;
        subtitle?: string;
    }>;
    getStatusBadgeVariant?: (status: string) => string;
    itemsPerPage?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onItemsPerPageChange?: (items: number) => void;
}

export default function AdminPageTemplate<T extends { id: number }>({
    title,
    pageTitle,
    description,
    breadcrumbs,
    data,
    loading,
    searchQuery,
    onSearchChange,
    onAdd,
    onEdit,
    onDelete,
    renderTableHeaders,
    renderTableRow,
    renderForm,
    renderDeleteConfirmation,
    showFormModal,
    showDeleteModal,
    onCloseFormModal,
    onCloseDeleteModal,
    onSave,
    submitting = false,
    editingItem = null,
    deletingItem = null,
    statsCards = [],
    getStatusBadgeVariant,
    itemsPerPage = 10,
    currentPage = 1,
    onPageChange,
    onItemsPerPageChange
}: AdminPageTemplateProps<T>) {
    // Filter data berdasarkan search
    const filteredData = data.filter((item: any) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        
        // Check common searchable fields
        const searchableFields = [
            'nama_artikel', 'nama_video', 'nama_sertifikasi', 'nama_posisi',
            'judul', 'title', 'deskripsi', 'description', 'status', 'penulis',
            'uploader', 'author', 'perusahaan', 'company'
        ];
        
        return searchableFields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(searchLower);
        });
    });

    // Pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        onPageChange?.(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        onItemsPerPageChange?.(items);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground font-serif">
                            {description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={onAdd} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah {title.split(' ')[1]}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                {statsCards.length > 0 && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {statsCards.map((stat, index) => (
                            <Card key={index} className="p-6">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{stat.value}</div>
                                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                                            {stat.subtitle && (
                                                <p className="text-xs text-green-600">{stat.subtitle}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar {title.split(' ')[1]}</CardTitle>
                            <div className="flex items-center gap-2">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    placeholder={`Cari ${title.toLowerCase()}...`}
                                    className="w-64"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Memuat data...</span>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {renderTableHeaders()}
                                        <TableHead className="w-[120px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item, index) => (
                                            <TableRow key={item.id}>
                                                {renderTableRow(item, index)}
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => onDelete(item)}
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
                                            <TableCell colSpan={20} className="text-center py-8 text-muted-foreground">
                                                {searchQuery
                                                    ? 'Tidak ada data yang sesuai dengan pencarian'
                                                    : `Tidak ada data ${title.toLowerCase()}`
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
                <Dialog open={showFormModal} onOpenChange={onCloseFormModal}>
                    <DialogContent className="max-w-5xl min-w-[300px] md:min-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? `Edit ${title.split(' ')[1]}` : `Tambah ${title.split(' ')[1]} Baru`}
                            </DialogTitle>
                        </DialogHeader>
                        {renderForm()}
                        <DialogFooter>
                            <Button variant="outline" onClick={onCloseFormModal}>
                                Batal
                            </Button>
                            <Button onClick={onSave} disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingItem ? 'Simpan Perubahan' : 'Tambah'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteModal} onOpenChange={onCloseDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        </DialogHeader>
                        {renderDeleteConfirmation()}
                        <DialogFooter>
                            <Button variant="outline" onClick={onCloseDeleteModal}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={onSave} disabled={submitting}>
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
