import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card'
import ChatInput from './components/ChatInput'

interface Person {
  id: number
  name: string
  age: number
  description: string
  imagePath: string
}

type Msg = { type: 'text' | 'image'; content: string; from: 'me' | 'them'; avatar?: string }

function App() {
  const [cards, setCards] = useState<{ id: number; name: string; age: number; description: string; imgSrc: string }[]>([])
  const [liked, setLiked] = useState<{ id: number; name: string; age: number; description: string; imgSrc: string }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [focusedPersonId, setFocusedPersonId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Record<string, Msg[]>>({})
  const [dragProgress, setDragProgress] = useState(0) // -1..1

  // profil kép (me) — alapértelmezett: /profile.png (helyezd a project public mappájába)
  const [userPic, setUserPic] = useState<string>('pictures/profile.png')
  const profileInputRef = useRef<HTMLInputElement | null>(null)

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

      // speciális: Balog Krisztián (id === 2) küld "Mizu?"-t tőle (them)
      // megjegyzés: most NEM nyitjuk automatikusan a chatet (nem hívjuk setSelected-et)
      if (person.id === 2) {
        setMessages((prev) => {
          const prevMsgs = prev[person.name] || []
          const alreadyHasIntro = prevMsgs.some((m) => m.type === 'text' && m.content === 'Kérsz képet a farkamról?' && m.from === 'them')
          if (alreadyHasIntro) return prev
          return { ...prev, [person.name]: [...prevMsgs, { type: 'text', content: 'Kérsz képet a farkamról?', from: 'them', avatar: person.imgSrc }] }
        })
      }
    }
    setCards((prev) => prev.filter((c) => c.id !== id))
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

  const handleSend = (payload: { type: 'text' | 'image'; content: string }) => {
    if (!selected) return
    setMessages((prev) => {
      const prevMsgs = prev[selected] || []
      const msg: Msg = { ...payload, from: 'me', avatar: userPic || undefined }
      return { ...prev, [selected]: [...prevMsgs, msg] }
    })
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setUserPic(reader.result as string)
      if (profileInputRef.current) profileInputRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  // vissza a randikeresésre: biztosítjuk, hogy a liked kártyák ne kerüljenek vissza a deckbe
  const handleBackToSearch = () => {
    setCards((prev) => prev.filter((c) => !liked.some((l) => l.id === c.id)))
    setSelected(null)
    setFocusedPersonId(null)
  }

  const redOpacity = Math.max(0, -dragProgress) * 0.75
  const greenOpacity = Math.max(0, dragProgress) * 0.75

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      {/* settings / profil feltöltés (jobb felül) */}
      <input ref={profileInputRef} id="profile-file-input" type="file" accept="image/*" onChange={handleProfileChange} style={{ display: 'none' }} />
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1200 }}>
        <label htmlFor="profile-file-input" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#fff', border: '1px solid #ddd', cursor: 'pointer' }}>
          <span style={{ fontSize: 14 }}>Settings</span>
          <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', background: '#eee' }}>
            {userPic ? <img src={userPic} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>Me</div>}
          </span>
        </label>
      </div>

      {/* sidebar */}
      <div style={{ width: 200, borderRight: '1px solid #ccc', padding: '16px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <h4>Üzenetek</h4>
        {liked.length === 0 ? <p>Nincs még jobbra húzott személy.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {liked.map((p, i) => (
              <button key={i} onClick={() => handleSelectMessage(p.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <img src={p.imgSrc} alt={p.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.9rem' }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* main */}
      <div id="card-holder" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div id="red" style={{ opacity: redOpacity }} />
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: 432, height: 560, border: '1px solid #ccc', padding: '8px', boxSizing: 'border-box' }}>
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

              <div>
                <button onClick={() => { setSelected(null); setFocusedPersonId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
              </div>
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
                        <img src={p.imgSrc} alt={p.name} draggable={false} style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 12, pointerEvents: 'none' }} />
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
                    gap: 8,
                  }}
                >
                  {(messages[selected] || []).map((msg, i) => (
                    msg.from === 'me' ? (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',          // középre igazítás
                          justifyContent: 'flex-end',
                          gap: 8,
                        }}
                      >
                        {msg.type === 'text' ? (
                          <div style={{ borderRadius: 25, backgroundColor: 'white', padding: '8px', maxWidth: 320, wordBreak: 'break-word' }}>
                            {msg.content}
                          </div>
                        ) : (
                          <div style={{ borderRadius: 12, backgroundColor: '#fff', padding: 6 }}>
                            <img src={msg.content} alt={`image-me-${i}`} style={{ maxWidth: 280, maxHeight: 300, borderRadius: 8, objectFit: 'cover', display: 'block' }} />
                          </div>
                        )}

                        {/* avatar for "me" - mindig középre igazítva az üzenet mellé */}
                        {userPic ? (
                          <img src={userPic} alt="me" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flex: '0 0 36px' }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, flex: '0 0 36px' }}>Me</div>
                        )}
                      </div>
                    ) : (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',          // középre igazítás
                          justifyContent: 'flex-start',
                          gap: 8,
                        }}
                      >
                        {/* avatar for "them" */}
                        {msg.avatar ? (
                          <img src={msg.avatar} alt="them" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flex: '0 0 36px' }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, flex: '0 0 36px' }}>U</div>
                        )}

                        {msg.type === 'text' ? (
                          <div style={{ borderRadius: 14, backgroundColor: '#f6f6f6', padding: 8, maxWidth: 320, wordBreak: 'break-word' }}>
                            {msg.content}
                          </div>
                        ) : (
                          <div style={{ borderRadius: 12, backgroundColor: '#fff', padding: 6 }}>
                            <img src={msg.content} alt={`image-them-${i}`} style={{ maxWidth: 280, maxHeight: 300, borderRadius: 8, objectFit: 'cover', display: 'block' }} />
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                <ChatInput onSend={handleSend} />
              </>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', width: 432, height: 560 }}>
            {cards.map((c, idx) => {
              const isTop = idx === 0
              return (
                <Card key={c.id} id={c.id} imgSrc={c.imgSrc} name={c.name} age={c.age} description={c.description} style={{ top: idx * 8, zIndex: cards.length - idx }} onSwipe={handleSwipe} onDragProgress={isTop ? setDragProgress : undefined} />
              )
            })}
          </div>
        )}
        <div id="green" style={{ opacity: greenOpacity }} />
      </div>
    </div>
  )
}

export default App
