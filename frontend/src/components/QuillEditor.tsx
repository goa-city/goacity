import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, placeholder, style }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const onChangeRef = useRef(onChange);
    const lastValueRef = useRef(value);
    const [isSourceMode, setIsSourceMode] = useState(false);

    // Keep the onChange callback fresh
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Mount Quill once
    useEffect(() => {
        if (!containerRef.current) return;

        // Custom icon for HTML source view
        const icons = Quill.import('ui/icons') as any;
        icons['html'] = '<svg viewBox="0 0 18 18"><path class="ql-even" d="M10.3,1.9l-2,14.2l-1.9-0.2L8.4,1.7L10.3,1.9z M3.8,12.7l-3-3.7l3-3.7l1.3,1L2.4,9l2.7,3.4L3.8,12.7z M12.8,12.7l-1.3-1l2.7-3.4l-2.7-3.4l1.3-1l3,3.7L12.8,12.7z"></path></svg>';

        const quill = new Quill(containerRef.current, {
            theme: 'snow',
            placeholder: placeholder || 'Write something...',
            modules: {
                toolbar: {
                    container: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'image'],
                        ['clean'],
                        ['html'], // Custom HTML button
                    ],
                    handlers: {
                        html: function() {
                            setIsSourceMode(prev => !prev);
                        }
                    }
                },
            },
        });

        quillRef.current = quill;

        // Sync initial value
        if (value) {
            quill.root.innerHTML = value;
        }

        quill.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user' && onChangeRef.current) {
                const html = quill.root.innerHTML;
                lastValueRef.current = html;
                onChangeRef.current(html);
            }
        });

        return () => {
            quill.off('text-change');
            quillRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external changes safely
    useEffect(() => {
        if (quillRef.current && value !== undefined && value !== lastValueRef.current) {
            if (value !== quillRef.current.root.innerHTML) {
                quillRef.current.root.innerHTML = value || '';
                lastValueRef.current = value;
            }
        }
    }, [value]);

    // Sync textarea when entering source mode
    useEffect(() => {
        if (isSourceMode && textareaRef.current && quillRef.current) {
            textareaRef.current.value = quillRef.current.root.innerHTML;
        } else if (!isSourceMode && quillRef.current && textareaRef.current) {
            const html = textareaRef.current.value;
            if (quillRef.current.root.innerHTML !== html) {
                quillRef.current.root.innerHTML = html;
                lastValueRef.current = html;
                if (onChangeRef.current) onChangeRef.current(html);
            }
        }
    }, [isSourceMode]);

    return (
        <div className="quill-editor-wrapper relative border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
            <div 
                ref={containerRef} 
                style={{ ...style, display: isSourceMode ? 'none' : 'block' }} 
            />
            {isSourceMode && (
                <div className="flex flex-col">
                    <div className="bg-zinc-900 text-zinc-400 text-[10px] px-4 py-1.5 font-black uppercase tracking-widest border-b border-zinc-800">
                        HTML Source Code
                    </div>
                    <textarea
                        ref={textareaRef}
                        className="w-full font-mono text-sm p-4 bg-zinc-950 text-emerald-400 focus:outline-none"
                        style={{ minHeight: style?.minHeight || '400px' }}
                        onChange={(e) => {
                            const val = e.target.value;
                            lastValueRef.current = val;
                            if (onChangeRef.current) onChangeRef.current(val);
                        }}
                    />
                </div>
            )}
            <style>{`
                .ql-toolbar.ql-snow { 
                    border: none !important; 
                    border-bottom: 1px solid #f1f5f9 !important; 
                    background: #f8fafc; 
                    padding: 10px 15px !important; 
                }
                .dark .ql-toolbar.ql-snow {
                    background: #18181b;
                    border-bottom: 1px solid #27272a !important;
                }
                .ql-container.ql-snow { 
                    border: none !important; 
                }
                .dark .ql-editor {
                    color: white;
                }
                .ql-html .ql-even { fill: #444; }
                .ql-active .ql-html .ql-even { fill: #10b981; }
            `}</style>
        </div>
    );
};

export default QuillEditor;
