import { useState, useEffect } from 'react'
import './App.css'
import autoResponsesData from './assets/auto_responses.json'

interface Person {
  id: number
  name: string
  age: number
  description: string
  imagePath: string
}

// DEFAULT fallback (ha a JSON nem tölthető)
const DEFAULT_AUTO_RESPONSES = Array.from({ length: 100 }, (_, i) => `Automatikus válasz #${i + 1}`)

import Card from './components/Card'
import ChatInput from './components/ChatInput'

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
  // messages now carry sender info
  const [messages, setMessages] = useState<Record<string, { sender: 'me' | 'them'; text: string }[]>>({})
  const [dragProgress, setDragProgress] = useState(0) // -1..1

  // auto responses state
  const [autoResponses, setAutoResponses] = useState<string[]>([])

  useEffect(() => {
    // betöltés people.json (marad)
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

    // auto_responses.json importból betöltése (bundle-olt fájl a src-ből)
    if (Array.isArray(autoResponsesData) && autoResponsesData.every((x) => typeof x === 'string')) {
      setAutoResponses(autoResponsesData)
    } else {
      console.warn('auto_responses.json nem megfelelő formátum, fallback használva.')
      setAutoResponses(DEFAULT_AUTO_RESPONSES)
    }
  }, [])

  const handleSwipe = (id: number, direction: 'left' | 'right') => {
    const person = cards.find((c) => c.id === id)
    if (direction === 'right' && person) {
      setLiked((prev) => [...prev, { id: person.id, name: person.name, age: person.age, description: person.description, imgSrc: person.imgSrc }])
    }
    setCards((prev) => prev.filter((c) => c.id !== id))
    // reset overlay
    setDragProgress(0)
  }

  const handleSelectMessage = (name: string) => {
    setSelected(name)
    setFocusedPersonId(null)
    setMessages((prev) => {
      if (prev[name]) return prev
      return { ...prev, [name]: [] }
    })
  }

  // Üzenetküldés: felhasználói üzenet + automatikus véletlen válasz 100 lehetőség közül
  const handleSend = (text: string) => {
    if (!selected) return
    // push user's message
    setMessages((prev) => {
      const prevMsgs = prev[selected] || []
      return { ...prev, [selected]: [...prevMsgs, { sender: 'me', text }] }
    })

    // kis késleltetéssel automatikus válasz (a másik oldalon, világoskék)
    setTimeout(() => {
      const pool = autoResponses.length ? autoResponses : DEFAULT_AUTO_RESPONSES
      const reply = pool[Math.floor(Math.random() * pool.length)]
      setMessages((prev) => {
        const prevMsgs = prev[selected] || []
        return { ...prev, [selected]: [...prevMsgs, { sender: 'them', text: reply }] }
      })
    }, 700)
  }

  // compute opacities: when centered -> 0, when moved fully to side -> 0.75
  const redOpacity = Math.max(0, -dragProgress) * 0.75
  const greenOpacity = Math.max(0, dragProgress) * 0.75

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
      <div id="card-holder" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          id="red"
          style={{
            opacity: redOpacity,
          }}
        />
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', height: '100%', boxSizing: 'border-box' }}>
                        <img
                          src={p.imgSrc}
                          alt={p.name}
                          draggable={false}
                          style={{
                            width: '100%',
                            height: 320,
                            objectFit: 'cover',
                            borderRadius: 12,
                            pointerEvents: 'none',
                          }}
                        />
                        <div style={{ textAlign: 'center', padding: '0 8px' }}>
                          <h4 style={{ margin: 0 }}>{p.name}, {p.age}</h4>
                          <p style={{ marginTop: 6 }}>{p.description}</p>
                        </div>
                      </div>
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
                    padding: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'stretch',
                  }}
                >
                  {(messages[selected] || []).map((msg, i) => {
                    const isMe = msg.sender === 'me'
                    return (
                      <div
                        key={i}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          backgroundColor: isMe ? 'white' : '#d9f6ff',
                          borderRadius: 18,
                          padding: '8px 12px',
                          marginBottom: 4,
                          maxWidth: '80%',
                          boxShadow: isMe ? '0 1px 0 rgba(0,0,0,0.05)' : undefined,
                          color: '#000',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.text}
                      </div>
                    )
                  })}
                </div>
                <ChatInput onSend={handleSend} />
              </>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', width: 360, height: 560 }}>
            {cards.map((c, idx) => {
              const isTop = idx === 0
              return (
                <Card
                  key={c.id}
                  id={c.id}
                  imgSrc={c.imgSrc}
                  name={c.name}
                  age={c.age}
                  description={c.description}
                  style={{ top: idx * 8, zIndex: cards.length - idx }}
                  onSwipe={handleSwipe}
                  onDragProgress={isTop ? setDragProgress : undefined}
                />
              )
            })}
          </div>
        )}
        <div
          id="green"
          style={{
            opacity: greenOpacity,
          }}
        />
      </div>
    </div>
  )
}

export default App
