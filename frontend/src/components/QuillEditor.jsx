import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const QuillEditor = ({ value, onChange, placeholder, style }) => {
    const containerRef = useRef(null);
    const quillRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const initializedRef = useRef(false);

    // Keep the onChange callback fresh without re-running the effect
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Mount Quill once
    useEffect(() => {
        if (!containerRef.current) return;

        const quill = new Quill(containerRef.current, {
            theme: 'snow',
            placeholder: placeholder || 'Write something...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                    ['clean'],
                ],
            },
        });

        quillRef.current = quill;

        quill.on('text-change', () => {
            if (onChangeRef.current) {
                onChangeRef.current(quill.getSemanticHTML());
            }
        });

        // Cleanup: destroy quill instance safely
        return () => {
            quill.off('text-change');
            quillRef.current = null;
            initializedRef.current = false;
            // Guard against React setting the ref to null before cleanup runs
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Set initial value once after Quill mounts
    useEffect(() => {
        if (quillRef.current && !initializedRef.current && value) {
            initializedRef.current = true;
            quillRef.current.root.innerHTML = value;
        }
    }, [value]);

    return (
        <div ref={containerRef} style={style} />
    );
};

export default QuillEditor;
