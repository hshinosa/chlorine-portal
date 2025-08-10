import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly itemsPerPage: number;
    readonly totalItems: number;
    readonly onPageChange: (page: number) => void;
    readonly onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Jika total halaman <= 5, tampilkan semua
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }
        
        // Jika total halaman > 5, tampilkan dengan logic
        if (currentPage <= 3) {
            // Di awal
            for (let i = 1; i <= 4; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            // Di akhir
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Di tengah
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-between px-2 py-4">
            {/* Info dan Items per page */}
            <div className="flex items-center gap-6">
                <div className="text-sm text-muted-foreground">
                    Menampilkan {startItem}-{endItem} dari {totalItems} data
                </div>
                
                {onItemsPerPageChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Tampilkan</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => onItemsPerPageChange(Number(value))}
                        >
                            <SelectTrigger className="w-16 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">per halaman</span>
                    </div>
                )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1">
                {/* First Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                {pageNumbers.map((page) => (
                    <React.Fragment key={`page-${page}`}>
                        {page === '...' ? (
                            <span className="px-2 text-muted-foreground">...</span>
                        ) : (
                            <Button
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(page as number)}
                                className="h-8 min-w-8 px-2"
                            >
                                {page}
                            </Button>
                        )}
                    </React.Fragment>
                ))}

                {/* Next Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
