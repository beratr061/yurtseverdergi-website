'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link2,
    Image as ImageIcon,
    Heading1,
    Heading2,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import '@/app/admin/editor.css';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = prompt('URL girin:');
        const text = prompt('Link metni:');
        if (url && text) {
            editor.chain().focus().insertContent(`<a href="${url}" class="text-primary-600 underline">${text}</a>`).run();
        }
    };

    const addImage = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                editor.chain().focus().setImage({ src: data.url }).run();
            } else {
                alert('Görsel yüklenemedi');
            }
        } catch (error) {
            alert('Görsel yüklenemedi');
        }
        
        // Reset input
        if (e.target) {
            e.target.value = '';
        }
    };

    return (
        <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('bold') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Kalın (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('italic') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="İtalik (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Başlık 1"
                >
                    <Heading1 className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Başlık 2"
                >
                    <Heading2 className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Başlık 3"
                >
                    <Heading2 className="h-4 w-4 scale-75" />
                </button>

                <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('bulletList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Madde İşaretli Liste"
                >
                    <List className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('orderedList') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Numaralı Liste"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('blockquote') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Alıntı"
                >
                    <Quote className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />

                <button
                    type="button"
                    onClick={addLink}
                    className={`p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${editor.isActive('link') ? 'bg-neutral-200 dark:bg-neutral-700' : ''
                        }`}
                    title="Link Ekle"
                >
                    <Link2 className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={addImage}
                    className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    title="Görsel Ekle"
                >
                    <ImageIcon className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    title="Geri Al (Ctrl+Z)"
                >
                    <Undo className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    title="İleri Al (Ctrl+Y)"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} className="prose-editor" />
            
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    );
}
