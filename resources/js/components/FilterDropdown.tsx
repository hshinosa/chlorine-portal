import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Filter } from 'lucide-react';

// Interface untuk filter options
interface FilterOption {
    value: string;
    label: string;
}

// Interface untuk active filters
interface ActiveFilters {
    jenisPendaftaran: string[];
    tanggalPendaftaran: {
        startDate: string;
        endDate: string;
    } | null;
    status: string[];
}

// Props untuk FilterDropdown component
interface FilterDropdownProps {
    readonly onFiltersChange: (filters: ActiveFilters) => void;
    readonly activeFilters: ActiveFilters;
}

export default function FilterDropdown({ onFiltersChange, activeFilters }: FilterDropdownProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter options
    const jenisPendaftaranOptions: FilterOption[] = [
        { value: 'Sertifikasi Kompetensi', label: 'Sertifikasi Kompetensi' },
        { value: 'Praktik Kerja Lapangan', label: 'Praktik Kerja Lapangan' },
    ];

    const statusOptions: FilterOption[] = [
        { value: 'Pengajuan', label: 'Pengajuan' },
        { value: 'Disetujui', label: 'Disetujui' },
        { value: 'Ditolak', label: 'Ditolak' },
    ];

    // Handle filter selection for jenis pendaftaran and status
    const handleFilterSelect = (filterType: 'jenisPendaftaran' | 'status', value: string) => {
        const newFilters = { ...activeFilters };
        
        if (filterType === 'jenisPendaftaran' || filterType === 'status') {
            const currentFilters = newFilters[filterType];
            if (currentFilters.includes(value)) {
                // Remove filter if already selected
                newFilters[filterType] = currentFilters.filter(item => item !== value);
            } else {
                // Add filter if not selected
                newFilters[filterType] = [...currentFilters, value];
            }
        }
        
        onFiltersChange(newFilters);
    };

    // Handle date filter
    const handleDateFilter = () => {
        if (startDate || endDate) {
            const newFilters = {
                ...activeFilters,
                tanggalPendaftaran: {
                    startDate: startDate,
                    endDate: endDate
                }
            };
            onFiltersChange(newFilters);
        }
    };

    // Clear date filter
    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        const newFilters = {
            ...activeFilters,
            tanggalPendaftaran: null
        };
        onFiltersChange(newFilters);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setStartDate('');
        setEndDate('');
        onFiltersChange({
            jenisPendaftaran: [],
            tanggalPendaftaran: null,
            status: [],
        });
    };

    // Get total active filter count
    const totalActiveFilters = 
        activeFilters.jenisPendaftaran.length +
        (activeFilters.tanggalPendaftaran ? 1 : 0) +
        activeFilters.status.length;

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                        {totalActiveFilters > 0 && (
                            <Badge 
                                variant="destructive" 
                                className="ml-2 px-1.5 py-0 text-xs h-5 min-w-5 flex items-center justify-center"
                            >
                                {totalActiveFilters}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                    {/* Jenis Pendaftaran */}
                    <DropdownMenuLabel>Jenis Pendaftaran</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {jenisPendaftaranOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleFilterSelect('jenisPendaftaran', option.value)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <span>{option.label}</span>
                                {activeFilters.jenisPendaftaran.includes(option.value) && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Tanggal Pendaftaran */}
                    <DropdownMenuLabel>Tanggal Pendaftaran</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <div className="px-2 py-1 space-y-2">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-muted-foreground">Dari Tanggal</span>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-muted-foreground">Sampai Tanggal</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button 
                                    size="sm" 
                                    onClick={handleDateFilter}
                                    className="flex-1 text-xs"
                                    disabled={!startDate && !endDate}
                                >
                                    Terapkan
                                </Button>
                                {activeFilters.tanggalPendaftaran && (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={clearDateFilter}
                                        className="flex-1 text-xs"
                                    >
                                        Hapus
                                    </Button>
                                )}
                            </div>
                            {activeFilters.tanggalPendaftaran && (
                                <div className="text-xs text-muted-foreground px-1">
                                    {activeFilters.tanggalPendaftaran.startDate && 
                                        `Dari: ${activeFilters.tanggalPendaftaran.startDate}`}
                                    {activeFilters.tanggalPendaftaran.startDate && activeFilters.tanggalPendaftaran.endDate && 
                                        " - "}
                                    {activeFilters.tanggalPendaftaran.endDate && 
                                        `Sampai: ${activeFilters.tanggalPendaftaran.endDate}`}
                                </div>
                            )}
                        </div>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Status */}
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {statusOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleFilterSelect('status', option.value)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <span>{option.label}</span>
                                {activeFilters.status.includes(option.value) && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>

                    {totalActiveFilters > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={clearAllFilters}
                                className="text-destructive cursor-pointer"
                            >
                                Clear All Filters
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>


        </div>
    );
}
