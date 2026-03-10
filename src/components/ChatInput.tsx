import React, { useRef, useState } from 'react'

type Payload = { type: 'text' | 'image'; content: string }

type Props = {
  onSend: (p: Payload) => void
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const emojis = ['😀', '😂', '😍', '😅', '😭', '😡', '👍', '🔥', '🎉', '🥰']

  const sendText = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend({ type: 'text', content: trimmed })
    setText('')
    setShowPicker(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendText()
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      onSend({ type: 'image', content: result })
      // reset so same file can be selected again
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsDataURL(file)
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

      <input
        ref={fileRef}
        id="chat-file-input"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <label htmlFor="chat-file-input" style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, background: '#f2f2f2', cursor: 'pointer' }}>
        📷
      </label>

      <button
        type="button"
        onClick={sendText}
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
