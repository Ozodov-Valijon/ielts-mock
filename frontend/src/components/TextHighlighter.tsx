'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TextHighlighterProps {
  content: string;
  className?: string;
}

interface HighlightItem {
  id: string;
  text: string;
  note?: string;
}

export default function TextHighlighter({ content, className = '' }: TextHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [notes, setNotes] = useState<HighlightItem[]>([]);
  const [activeNoteText, setActiveNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Sichqoncha orqali matn tanlanganda menyu chiqarish
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setMenuPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2 && containerRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setMenuPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 42,
        });
      } else {
        setMenuPosition(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.className = 'bg-yellow-200 text-gray-900 rounded px-1 transition-colors hover:bg-yellow-300 cursor-pointer';
    mark.title = "Belgilangan matn (O'chirish uchun ustiga bosing)";
    mark.onclick = () => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent?.insertBefore(mark.firstChild, mark);
      }
      parent?.removeChild(mark);
    };

    try {
      range.surroundContents(mark);
      selection.removeAllRanges();
    } catch {
      // Agar tanlov bir nechta elementlarni kesib o'tsa
      document.execCommand('hiliteColor', false, '#fef08a');
    }

    setMenuPosition(null);
    setSelectedText('');
  };

  const handleAddNote = () => {
    if (!selectedText) return;
    setShowNoteModal(true);
    setMenuPosition(null);
  };

  const saveNote = () => {
    if (!activeNoteText.trim()) {
      setShowNoteModal(false);
      return;
    }
    const newNote: HighlightItem = {
      id: Date.now().toString(),
      text: selectedText,
      note: activeNoteText.trim(),
    };
    setNotes((prev) => [...prev, newNote]);
    handleHighlight();
    setActiveNoteText('');
    setShowNoteModal(false);
  };

  return (
    <div className="relative">
      {/* Floating Cambridge Context Menu */}
      {menuPosition && (
        <div
          style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
          className="fixed z-50 transform -translate-x-1/2 flex items-center bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1 space-x-1 border border-gray-700 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={handleHighlight}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold hover:bg-yellow-500 hover:text-black rounded transition"
          >
            <span>🖍️</span>
            <span>Highlight</span>
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <button
            onClick={handleAddNote}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold hover:bg-blue-600 rounded transition"
          >
            <span>📝</span>
            <span>Note</span>
          </button>
        </div>
      )}

      {/* Matn konteyneri */}
      <div
        ref={containerRef}
        className={`leading-relaxed select-text font-serif text-gray-800 ${className}`}
      >
        {content}
      </div>

      {/* Eslatmalar Ro'yxati (Agar mavjud bo'lsa) */}
      {notes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center space-x-1">
            <span>📝</span>
            <span>Sizning eslatmalaringiz ({notes.length})</span>
          </h4>
          <div className="space-y-2">
            {notes.map((item) => (
              <div
                key={item.id}
                className="bg-yellow-50 border-l-4 border-yellow-400 p-2.5 rounded-r text-xs text-gray-800 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold text-gray-700 italic">&ldquo;{item.text.slice(0, 60)}...&rdquo;</p>
                  <p className="mt-1 font-sans text-gray-900">{item.note}</p>
                </div>
                <button
                  onClick={() => setNotes((prev) => prev.filter((n) => n.id !== item.id))}
                  className="text-gray-400 hover:text-red-600 ml-2 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eslatma Kiritish Modali */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center space-x-1.5">
              <span>📝</span>
              <span>Matnga izoh qoldirish</span>
            </h3>
            <p className="text-xs text-gray-500 mb-3 italic line-clamp-2">
              &ldquo;{selectedText}&rdquo;
            </p>
            <textarea
              value={activeNoteText}
              onChange={(e) => setActiveNoteText(e.target.value)}
              placeholder="Masalan: 3-savol uchun asosiy dalil..."
              rows={3}
              className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                onClick={saveNote}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
