import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Hash, FileText, ChevronRight, CornerDownLeft } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, slides, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const newResults = [];

        slides.forEach((slide, index) => {
            let match = null;

            // Helper to add match
            const addMatch = (source, context) => {
                if (!match) { // Only add one match per slide to avoid clutter
                    match = {
                        slideIndex: index,
                        title: slide.title || `Slide ${index + 1}`,
                        subtitle: slide.subtitle || slide.module || '',
                        context: context || source,
                        type: slide.type
                    };
                    newResults.push(match);
                }
            };

            // 1. Check Title & Subtitle
            if (slide.title?.toLowerCase().includes(lowerQuery)) addMatch(slide.title, 'Title Match');
            if (slide.subtitle?.toLowerCase().includes(lowerQuery)) addMatch(slide.subtitle, 'Subtitle Match');

            // 2. Check Module
            if (slide.module?.toLowerCase().includes(lowerQuery)) addMatch(slide.module, 'Module Match');

            // 3. Check Content (Array)
            if (slide.content && Array.isArray(slide.content)) {
                slide.content.forEach(item => {
                    if (typeof item === 'string') {
                        if (item.toLowerCase().includes(lowerQuery)) addMatch(item, item);
                    } else if (typeof item === 'object') {
                        if (item.title?.toLowerCase().includes(lowerQuery)) addMatch(item.title, `Point: ${item.title}`);
                        if (item.desc?.toLowerCase().includes(lowerQuery)) addMatch(item.desc, `Desc: ...${item.desc.substring(0, 50)}...`);
                        if (item.id?.toLowerCase().includes(lowerQuery)) addMatch(item.id, `ID: ${item.id}`);
                    }
                });
            }

            // 4. Check Points (Array of objects)
            if (slide.points && Array.isArray(slide.points)) {
                slide.points.forEach(point => {
                    if (point.title?.toLowerCase().includes(lowerQuery)) addMatch(point.title, `Point: ${point.title}`);
                    if (point.desc?.toLowerCase().includes(lowerQuery)) addMatch(point.desc, `Desc: ...${point.desc.substring(0, 50)}...`);
                });
            }

            // 5. Check Checklist
            if (slide.checklist && Array.isArray(slide.checklist)) {
                slide.checklist.forEach(item => {
                    if (item.toLowerCase().includes(lowerQuery)) addMatch(item, `Checklist: ${item}`);
                });
            }

            // 6. Check Q&A
            if (slide.question?.toLowerCase().includes(lowerQuery)) addMatch(slide.question, `Q: ${slide.question}`);
            if (slide.answer?.toLowerCase().includes(lowerQuery)) addMatch(slide.answer, `A: ${slide.answer}`);

            // 7. Check Action Item
            if (slide.actionItem) {
                if (slide.actionItem.title?.toLowerCase().includes(lowerQuery)) addMatch(slide.actionItem.title, `Action: ${slide.actionItem.title}`);
                if (slide.actionItem.code?.toLowerCase().includes(lowerQuery)) addMatch(slide.actionItem.code, 'Code Block Match');
                if (slide.actionItem.example?.toLowerCase().includes(lowerQuery)) addMatch(slide.actionItem.example, 'Example Match');
            }
        });

        // Also allow searching by Slide Number
        const pageNum = parseInt(query);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= slides.length) {
            newResults.unshift({
                slideIndex: pageNum - 1,
                title: `Go to Slide ${pageNum}`,
                subtitle: 'Jump to specific page',
                context: 'Page Number',
                type: 'navigation'
            });
        }

        setResults(newResults);
        setSelectedIndex(0);

    }, [query, slides]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    onNavigate(results[selectedIndex].slideIndex);
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, onNavigate, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current && resultsRef.current.children[selectedIndex]) {
            resultsRef.current.children[selectedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header / Input */}
                <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-grow bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                        placeholder="Search slides, content, or page number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">ESC</span>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-grow overflow-y-auto p-2 space-y-1" ref={resultsRef}>
                    {results.length === 0 && query && (
                        <div className="text-center py-12 text-gray-500">
                            No results found for "{query}"
                        </div>
                    )}

                    {results.length === 0 && !query && (
                        <div className="text-center py-12 text-gray-400">
                            Type to search...
                        </div>
                    )}

                    {results.map((result, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                onNavigate(result.slideIndex);
                                onClose();
                            }}
                            className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${idx === selectedIndex
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <div className="flex-shrink-0 mt-1 mr-4 text-gray-400">
                                {result.type === 'navigation' ? <Hash className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-sm font-medium ${idx === selectedIndex ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {result.title}
                                    </h4>
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">Page {result.slideIndex + 1}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate mt-0.5">
                                    {result.context}
                                </p>
                            </div>
                            {idx === selectedIndex && (
                                <div className="flex-shrink-0 ml-3 self-center text-gray-400">
                                    <CornerDownLeft className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                    <span>{results.length} results</span>
                    <span className="flex items-center gap-1">
                        Use <kbd className="font-sans px-1 bg-gray-200 dark:bg-gray-700 rounded">↑</kbd> <kbd className="font-sans px-1 bg-gray-200 dark:bg-gray-700 rounded">↓</kbd> to navigate
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
