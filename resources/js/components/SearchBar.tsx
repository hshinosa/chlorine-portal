import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder?: string;
    readonly className?: string;
}

export default function SearchBar({ 
    value, 
    onChange, 
    placeholder = "Cari...", 
    className = "w-64" 
}: SearchBarProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
                placeholder={placeholder}
                className={`pl-10 ${className}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
