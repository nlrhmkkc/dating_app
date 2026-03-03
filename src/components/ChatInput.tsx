import React, { useState } from 'react'

type Props = {
  onSend: (text: string) => void
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState('')

  const send = () => {
    if (text.trim() === '') return
    onSend(text.trim())
    setText('')
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      send()
    }
  }

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        style={{ flex: 1, padding: '4px' }}
        placeholder="Írj üzenetet..."
      />
      <button onClick={send} style={{ padding: '4px 8px' }}>
        Küldés
      </button>
    </div>
  )
}
