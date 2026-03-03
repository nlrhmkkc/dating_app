import { useState, useEffect } from 'react'

interface Person{
  id: number;
  name: string;
  age: number;
  description: string;
  imagePath: string;
}

import Card from './components/Card'
import ChatInput from './components/ChatInput'

interface Person {
  id: number
  name: string
  age: number
  description: string
  imagePath: string
}

function App() {
  const [cards, setCards] = useState<{
    id: number
    name: string
    age: number
    description: string
    imgSrc: string
  }[]>([])
  const [liked, setLiked] = useState<{
    id: number
    name: string
    age: number
    description: string
    imgSrc: string
  }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [focusedPersonId, setFocusedPersonId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Record<string, string[]>>({})
  useEffect(() => {
    fetch('/src/assets/people.json')
      .then((res) => res.json())
      .then((data: Person[]) => {
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.name,
          age: p.age,
          description: p.description,
          imgSrc: p.imagePath,
        }))
        setCards(mapped)
      })
      .catch((err) => console.error('Failed to load people.json', err))
  }, [])

  const handleSwipe = (id: number, direction: 'left' | 'right') => {
    const person = cards.find((c) => c.id === id)
    if (direction === 'right' && person) {
      setLiked((prev) => [...prev, { id: person.id, name: person.name, age: person.age, description: person.description, imgSrc: person.imgSrc }])
    }
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSelectMessage = (name: string) => {
    setSelected(name)
    setFocusedPersonId(null)
    setMessages((prev) => {
      if (prev[name]) return prev
      return { ...prev, [name]: [] }
    })
  }

  const handleSend = (text: string) => {
    if (!selected) return
    setMessages((prev) => {
      const prevMsgs = prev[selected] || []
      return { ...prev, [selected]: [...prevMsgs, text] }
    })
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* sidebar */}
      <div
        style={{
          width: 200,
          borderRight: '1px solid #ccc',
          padding: '16px',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <h4>Üzenetek</h4>
        {liked.length === 0 ? (
          <p>Nincs még jobbra húzott személy.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {liked.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSelectMessage(p.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <img
                  src={p.imgSrc}
                  alt={p.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <span style={{ fontSize: '0.9rem' }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* main card area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {selected ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 360,
              height: 560,
              border: '1px solid #ccc',
              padding: '8px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>
                <button
                  onClick={() => {
                    const p = liked.find((x) => x.name === selected)
                    if (p) setFocusedPersonId(p.id)
                  }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '1rem' }}
                >
                  Chat with {selected}
                </button>
              </h3>
              <button onClick={() => { setSelected(null); setFocusedPersonId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            </div>
            {focusedPersonId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => setFocusedPersonId(null)} style={{ padding: '4px', cursor: 'pointer' }}>Vissza a chathez</button>
                </div>
                <div style={{ position: 'relative', width: '100%', height: 420 }}>
                  {(() => {
                    const p = liked.find((x) => x.id === focusedPersonId)
                    if (!p) return <div>Kártya nem található.</div>
                    return (
                      <Card
                        key={p.id}
                        id={p.id}
                        imgSrc={p.imgSrc}
                        name={p.name}
                        age={p.age}
                        description={p.description}
                        style={{ top: 0, zIndex: 1 }}
                        onSwipe={() => {}}
                      />
                    )
                  })()}
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    padding: '4px',
                    marginBottom: '8px',
                  }}
                >
                  {(messages[selected] || []).map((msg, i) => (
                    <div key={i} style={{ padding: '2px 0' }}>
                      {msg}
                    </div>
                  ))}
                </div>
                <ChatInput onSend={handleSend} />
              </>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', width: 360, height: 560 }}>
            {cards.map((c, idx) => (
              <Card
                key={c.id}
                id={c.id}
                imgSrc={c.imgSrc}
                name={c.name}
                age={c.age}
                description={c.description}
                style={{ top: idx * 8, zIndex: cards.length - idx }}
                onSwipe={handleSwipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
