import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Bold, 
    Italic, 
    Underline, 
    List, 
    ListOrdered, 
    AlignLeft, 
    AlignCenter, 
    AlignRight,
    Quote,
    Link,
    Undo,
    Redo,
    Type,
    Image,
    Upload,
    MousePointer2,
    Move3D
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    id?: string;
}

export default function RichTextEditor({ 
    value, 
    onChange, 
    placeholder = "Tulis isi artikel di sini...", 
    className = "",
    label = "Konten Artikel",
    id = "konten"
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isUpdatingRef = useRef(false);
    const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

    // Update active states for formatting buttons
    const updateActiveStates = useCallback(() => {
        if (!editorRef.current) return;
        
        const states = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
        };
        
        setActiveStates(states);
    }, []);

    // Initialize editor content
    useEffect(() => {
        if (editorRef.current && value && !isUpdatingRef.current) {
            editorRef.current.innerHTML = value;
        }
    }, []);

    // Handle image resizing with event delegation
    useEffect(() => {
        const handleEditorClick = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Image clicked via delegation!'); // Debug log
                
                const img = target as HTMLImageElement;
                setSelectedImage(img); // Set selected image for alignment controls
                
                // Check if it's a double click for resizing
                const now = Date.now();
                const lastClick = img.dataset.lastClick ? parseInt(img.dataset.lastClick) : 0;
                const isDoubleClick = now - lastClick < 300;
                
                if (isDoubleClick) {
                    // Handle resize on double click
                    const currentWidthStyle = img.style.width || '100%';
                    console.log('Current width:', currentWidthStyle); // Debug log
                    
                    // Cycle through different sizes: 25% → 50% → 75% → 100% → 25%
                    if (currentWidthStyle === '25%') {
                        img.style.width = '50%';
                    } else if (currentWidthStyle === '50%') {
                        img.style.width = '75%';
                    } else if (currentWidthStyle === '75%') {
                        img.style.width = '100%';
                    } else {
                        img.style.width = '25%';
                    }
                    
                    console.log('New width:', img.style.width); // Debug log
                    
                    // Update onChange to reflect the change
                    if (editorRef.current) {
                        onChange(editorRef.current.innerHTML);
                    }
                }
                
                img.dataset.lastClick = now.toString();
            } else {
                // Clicked outside image, deselect
                setSelectedImage(null);
            }
        };

        const setupImages = () => {
            if (!editorRef.current) return;
            
            const images = editorRef.current.querySelectorAll('img');
            console.log('Setting up images:', images.length); // Debug log
            
            images.forEach((img, index) => {
                console.log(`Setting up image ${index}:`, img); // Debug log
                
                // Set styling
                img.style.cursor = 'pointer';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.setAttribute('contenteditable', 'false'); // Prevent editing
                
                // Set default width if not already set
                if (!img.style.width) {
                    img.style.width = '100%';
                }
                
                // Set default alignment if not already set
                if (!img.style.marginLeft && !img.style.marginRight && !img.style.float) {
                    img.style.display = 'block';
                    img.style.marginLeft = 'auto';
                    img.style.marginRight = 'auto';
                }
                
                console.log(`Image ${index} setup complete`); // Debug log
            });
        };

        // Set up event delegation on editor
        if (editorRef.current) {
            editorRef.current.addEventListener('click', handleEditorClick, true);
        }

        setupImages();
        
        // Re-run when content changes
        const observer = new MutationObserver(setupImages);
        if (editorRef.current) {
            observer.observe(editorRef.current, { childList: true, subtree: true });
        }
        
        return () => {
            if (editorRef.current) {
                editorRef.current.removeEventListener('click', handleEditorClick, true);
            }
            observer.disconnect();
        };
    }, [onChange]);

    const executeCommand = useCallback((command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            
            // Update the value after command execution
            isUpdatingRef.current = true;
            onChange(editorRef.current.innerHTML);
            
            // Update active states after command execution
            setTimeout(() => {
                updateActiveStates();
                isUpdatingRef.current = false;
            }, 10);
        }
    }, [onChange, updateActiveStates]);

    const handleInput = useCallback(() => {
        if (editorRef.current && !isUpdatingRef.current) {
            isUpdatingRef.current = true;
            onChange(editorRef.current.innerHTML);
            setTimeout(() => {
                updateActiveStates();
                isUpdatingRef.current = false;
            }, 10);
        }
    }, [onChange, updateActiveStates]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    // Image upload functions
    const handleImageUpload = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (editorRef.current) {
                editorRef.current.focus();
                
                // Create image element with initial styling
                const img = document.createElement('img');
                img.src = result;
                img.style.width = '100%';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.cursor = 'pointer';
                img.style.display = 'block';
                img.style.marginLeft = 'auto';
                img.style.marginRight = 'auto';
                img.style.marginBottom = '10px';
                img.setAttribute('contenteditable', 'false'); // Prevent editing
                
                // Insert image at cursor position
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(img);
                    range.setStartAfter(img);
                    range.setEndAfter(img);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    // Fallback: append to editor
                    editorRef.current.appendChild(img);
                }
                
                // Trigger mutation observer to set up click handler
                setTimeout(() => {
                    onChange(editorRef.current!.innerHTML);
                }, 10);
            }
        };
        reader.readAsDataURL(file);
    }, [onChange]);

    const handleFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleImageUpload]);

    // Drag and drop functions
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));
        
        if (imageFile) {
            handleImageUpload(imageFile);
        }
    }, [handleImageUpload]);

    // Image alignment functions
    const alignImage = useCallback((alignment: 'left' | 'center' | 'right') => {
        if (!selectedImage) return;
        
        // Reset previous alignment styles
        selectedImage.style.float = '';
        selectedImage.style.marginLeft = '';
        selectedImage.style.marginRight = '';
        selectedImage.style.display = '';
        
        switch (alignment) {
            case 'left':
                selectedImage.style.float = 'left';
                selectedImage.style.marginRight = '15px';
                selectedImage.style.marginBottom = '10px';
                break;
            case 'center':
                selectedImage.style.display = 'block';
                selectedImage.style.marginLeft = 'auto';
                selectedImage.style.marginRight = 'auto';
                selectedImage.style.marginBottom = '10px';
                break;
            case 'right':
                selectedImage.style.float = 'right';
                selectedImage.style.marginLeft = '15px';
                selectedImage.style.marginBottom = '10px';
                break;
        }
        
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [selectedImage, onChange]);

    const insertLink = useCallback(() => {
        const url = prompt('Masukkan URL:');
        if (url) {
            executeCommand('createLink', url);
        }
    }, [executeCommand]);

    const handleHeadingChange = useCallback((value: string) => {
        if (value === 'p') {
            executeCommand('formatBlock', 'div');
        } else {
            executeCommand('formatBlock', value);
        }
    }, [executeCommand]);

    const formatButtons = [
        { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
        { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
        { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
        { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
        { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
        { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
        { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)' },
        { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Y)' },
    ];

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={id}>{label}</Label>
            <div className="border border-input rounded-md overflow-hidden">
                {/* Toolbar */}
                <div className="border-b border-input bg-muted/50 p-2">
                    <div className="flex flex-wrap gap-1 items-center">
                        {/* Heading Selector */}
                        <Select onValueChange={handleHeadingChange}>
                            <SelectTrigger className="w-24 h-8 text-xs">
                                <SelectValue placeholder="Normal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="div">Normal</SelectItem>
                                <SelectItem value="h1">Heading 1</SelectItem>
                                <SelectItem value="h2">Heading 2</SelectItem>
                                <SelectItem value="h3">Heading 3</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <div className="w-px bg-border mx-1" />
                        
                        {formatButtons.map(({ icon: Icon, command, value, title }) => (
                            <Button
                                key={command}
                                type="button"
                                variant={activeStates[command] ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-8 w-8 p-0",
                                    activeStates[command] 
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                        : "hover:bg-accent"
                                )}
                                title={title}
                                onClick={() => executeCommand(command, value)}
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        ))}
                        <div className="w-px bg-border mx-1" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title="Upload Image"
                            onClick={handleFileSelect}
                        >
                            <Image className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title="Insert Link"
                            onClick={insertLink}
                        >
                            <Link className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Image Alignment Toolbar - Only show when image is selected */}
                {selectedImage && (
                    <div className="border-b border-input bg-blue-50/50 p-2">
                        <div className="flex gap-1 items-center">
                            <span className="text-xs font-medium text-blue-700 mr-2">
                                <Move3D className="h-3 w-3 inline mr-1" />
                                Posisi Gambar:
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs hover:bg-blue-100"
                                title="Rata Kiri"
                                onClick={() => alignImage('left')}
                            >
                                <AlignLeft className="h-3 w-3 mr-1" />
                                Kiri
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs hover:bg-blue-100"
                                title="Rata Tengah"
                                onClick={() => alignImage('center')}
                            >
                                <AlignCenter className="h-3 w-3 mr-1" />
                                Tengah
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs hover:bg-blue-100"
                                title="Rata Kanan"
                                onClick={() => alignImage('right')}
                            >
                                <AlignRight className="h-3 w-3 mr-1" />
                                Kanan
                            </Button>
                            <div className="text-xs text-blue-600 ml-2">
                                Double-click gambar untuk ubah ukuran
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Editor */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={cn(
                        "min-h-[200px] w-full p-3 text-sm bg-background relative",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "prose prose-sm max-w-none",
                        "[&_p]:my-2 [&_div]:my-2",
                        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4",
                        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-3",
                        "[&_h3]:text-lg [&_h3]:font-medium [&_h3]:my-2",
                        "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2",
                        "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2",
                        "[&_li]:my-1",
                        "[&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground",
                        "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground",
                        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:cursor-pointer",
                        "[&_strong]:font-bold [&_em]:italic [&_u]:underline",
                        "[&_img]:rounded-md [&_img]:shadow-sm [&_img]:border [&_img]:border-border [&_img]:cursor-pointer",
                        "[&_img:hover]:shadow-md [&_img:hover]:border-primary/50",
                        "[&_img[style*='float:left']]:mr-4 [&_img[style*='float:right']]:ml-4",
                        "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none",
                        isDragOver && "ring-2 ring-primary ring-offset-2 bg-primary/5"
                    )}
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onKeyUp={updateActiveStates}
                    onMouseUp={updateActiveStates}
                    onFocus={updateActiveStates}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    data-placeholder={placeholder}
                    style={{
                        minHeight: '200px'
                    }}
                />
                
                {/* Drag overlay */}
                {isDragOver && (
                    <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center pointer-events-none">
                        <div className="bg-background/90 rounded-lg p-4 shadow-lg">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium text-primary">Drop image here</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Helper text */}
            <p className="text-xs text-muted-foreground">
                Gunakan toolbar di atas untuk memformat teks. Pilih heading untuk judul, gunakan shortcut: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline). 
                Klik gambar untuk memilih, lalu gunakan toolbar posisi. Double-click gambar untuk mengubah ukuran atau drag & drop gambar ke editor.
            </p>
        </div>
    );
}
