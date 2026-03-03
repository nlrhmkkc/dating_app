import React, { useRef, useState } from 'react'

type Props = {
  onSend: (text: string) => void
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const emojis = ['😀', '😂', '😍', '😅', '😭', '😡', '👍', '🔥', '🎉', '🥰']

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    setShowPicker(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setShowPicker(false)
    }
  }

  const addEmoji = (emoji: string) => {
    setText((t) => t + emoji)
    setShowPicker(false)
    inputRef.current?.focus()
  }

  return (
    <div style={{ position: 'relative', display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Írj üzenetet..."
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: 20,
          border: '1px solid #ccc',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Emoji button (placed between the text box and the send button) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowPicker((s) => !s)}
          aria-label="Emoji"
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #272222ff',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          😊
        </button>

        {showPicker && (
          <div
            role="dialog"
            aria-label="Emoji picker"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 8,
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 6,
              zIndex: 999,
              width: 250,
            }}
          >
            {emojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => addEmoji(em)}
                style={{
                  fontSize: 20,
                  padding: 6,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {em}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSend}
        style={{
          padding: '8px 12px',
          borderRadius: 20,
          border: 'none',
          background: '#007bff',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Küldés
      </button>
    </div>
  )
}
