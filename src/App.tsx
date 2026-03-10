import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card'
import ChatInput from './components/ChatInput'
import autoResponsesData from './assets/auto_responses.json'

interface Person {
  id: number
  name: string
  age: number
  description: string
  imagePath: string
}

type Msg = { type: 'text' | 'image'; content: string; from: 'me' | 'them'; avatar?: string }

// DEFAULT fallback (ha a JSON nem tölthető)
const DEFAULT_AUTO_RESPONSES = Array.from({ length: 100 }, (_, i) => `Automatikus válasz #${i + 1}`)

function App() {
  const [cards, setCards] = useState<{ id: number; name: string; age: number; description: string; imgSrc: string }[]>([])
  const [liked, setLiked] = useState<{ id: number; name: string; age: number; description: string; imgSrc: string }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [focusedPersonId, setFocusedPersonId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Record<string, Msg[]>>({})
  const [dragProgress, setDragProgress] = useState(0) // -1..1

  // profil kép (me)
  const [userPic, setUserPic] = useState<string>('pictures/profile.png')
  const profileInputRef = useRef<HTMLInputElement | null>(null)

  // auto responses state
  const [autoResponses, setAutoResponses] = useState<string[]>([])

  useEffect(() => {
    // load people
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

    // load auto responses from imported JSON (bundle)
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

      // example special message (kept, but using safe Msg shape)
      if (person.id === 2) {
        setMessages((prev) => {
          const prevMsgs = prev[person.name] || []
          const alreadyHasIntro = prevMsgs.some((m) => m.type === 'text' && m.content === 'Kérsz képet a farkamról?' && m.from === 'them')
          if (alreadyHasIntro) return prev
          return {
            ...prev,
            [person.name]: [
              ...prevMsgs,
              { type: 'text', content: 'Kérsz képet a farkamról?', from: 'them', avatar: person.imgSrc },
            ],
          }
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

  // Accept either string (text) or a payload with type/content (for images)
  const handleSend = (payload: string | { type: 'text' | 'image'; content: string }) => {
    if (!selected) return

    const msg: Msg =
      typeof payload === 'string'
        ? { type: 'text', content: payload, from: 'me', avatar: userPic || undefined }
        : { ...payload, from: 'me', avatar: userPic || undefined }

    // push user's message
    setMessages((prev) => {
      const prevMsgs = prev[selected] || []
      return { ...prev, [selected]: [...prevMsgs, msg] }
    })

    // autosuggest reply after delay (from "them", light-blue bubble)
    setTimeout(() => {
      const pool = autoResponses.length ? autoResponses : DEFAULT_AUTO_RESPONSES
      const replyText = pool[Math.floor(Math.random() * pool.length)]
      const themAvatar = liked.find((l) => l.name === selected)?.imgSrc
      const reply: Msg = { type: 'text', content: replyText, from: 'them', avatar: themAvatar }

      setMessages((prev) => {
        const prevMsgs = prev[selected] || []
        return { ...prev, [selected]: [...prevMsgs, reply] }
      })
    }, 700)
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

  const redOpacity = Math.max(0, -dragProgress) * 0.75
  const greenOpacity = Math.max(0, dragProgress) * 0.75

  // ref a chat üzenetek konténeréhez
  const messagesRef = useRef<HTMLDivElement | null>(null)

  // amikor változnak az üzenetek vagy a kiválasztott chat, görgessünk az utolsó üzenethez
  useEffect(() => {
    if (!selected) return
    const el = messagesRef.current
    if (!el) return
    // azonnal az aljára állítjuk (ha inkább smooth kell, használd a behavior:'smooth'-ot)
    el.scrollTop = el.scrollHeight
  }, [messages, selected])

  return (
    <div className="app-root">
      <input ref={profileInputRef} id="profile-file-input" type="file" accept="image/*" onChange={handleProfileChange} style={{ display: 'none' }} />
      <div className="settings" style={{ position: 'absolute', top: 12, right: 12, zIndex: 1200 }}>
        <label htmlFor="profile-file-input" className="settings-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#fff', border: '1px solid #ddd', cursor: 'pointer' }}>
          <span className="settings-text" style={{ fontSize: 14 }}>Settings</span>
          <span className="settings-avatar" style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', background: '#eee' }}>
            {userPic ? <img src={userPic} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="settings-avatar-fallback" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>Me</div>}
          </span>
        </label>
      </div>

      <div className="app-wrapper">
        {/* sidebar */}
        <div className="sidebar" style={{ width: 200, borderRight: '1px solid #ccc', padding: '16px', boxSizing: 'border-box', overflowY: 'auto' }}>
          <h4>Üzenetek</h4>
          {liked.length === 0 ? (
            <p>Nincs még jobbra húzott személy.</p>
          ) : (
            <div className="liked-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {liked.map((p, i) => (
                <button key={i} onClick={() => handleSelectMessage(p.name)} className="liked-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <img className="liked-avatar" src={p.imgSrc} alt={p.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <span className="liked-name" style={{ fontSize: '0.9rem' }}>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* main */}
        <div id="card-holder" className="card-holder" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div id="red" className="overlay-red" style={{ opacity: redOpacity }} />
          {selected ? (
            <div className="chat-window" style={{ display: 'flex', flexDirection: 'column', width: 432, height: 560, border: '1px solid #ccc', padding: '8px', boxSizing: 'border-box' }}>
              <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="chat-title" style={{ margin: 0 }}>
                  <button
                    onClick={() => {
                      const p = liked.find((x) => x.name === selected)
                      if (p) setFocusedPersonId(p.id)
                    }}
                    className="chat-open-person"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '1rem' }}
                  >
                    Chat with {selected}
                  </button>
                </h3>

                <div className="chat-close">
                  <button onClick={() => { setSelected(null); setFocusedPersonId(null) }} className="chat-close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                </div>
              </div>

              {focusedPersonId ? (
                <div className="person-preview" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="person-back" style={{ textAlign: 'right' }}>
                    <button onClick={() => setFocusedPersonId(null)} className="back-to-chat" style={{ padding: '4px', cursor: 'pointer' }}>Vissza a chathez</button>
                  </div>
                  <div className="person-card" style={{ position: 'relative', width: '100%', height: 420 }}>
                    {(() => {
                      const p = liked.find((x) => x.id === focusedPersonId)
                      if (!p) return <div>Kártya nem található.</div>
                      return (
                        <div className="person-card-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', height: '100%', boxSizing: 'border-box' }}>
                          <img src={p.imgSrc} alt={p.name} draggable={false} style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 12, pointerEvents: 'none' }} />
                          <div className="person-info" style={{ textAlign: 'center', padding: '0 8px' }}>
                            <h4 className="person-name" style={{ margin: 0 }}>{p.name}, {p.age}</h4>
                            <p className="person-description" style={{ marginTop: 6 }}>{p.description}</p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    ref={messagesRef}
                    className="chatMessages"
                    style={{
                      flex: 1,
                      border: '1px solid #eee',
                      padding: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {(messages[selected] || []).map((msg, i) => (
                      <div key={i} className={`msg-row ${msg.from === 'me' ? 'msg-me' : 'msg-them'}`} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                        {msg.from === 'them' ? (
                          <>
                            {msg.avatar ? <img src={msg.avatar} alt="them" className="msg-them-avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flex: '0 0 36px' }} /> : <div className="msg-them-avatar fallback" style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>U</div>}
                            {msg.type === 'text' ? (
                              <div className="bubble-them" style={{ borderRadius: 14, backgroundColor: '#d9f6ff', padding: 8, maxWidth: 320, wordBreak: 'break-word' }}>{msg.content}</div>
                            ) : (
                              <div className="bubble-img" style={{ borderRadius: 12, backgroundColor: '#fff', padding: 6 }}><img src={msg.content} alt={`image-them-${i}`} style={{ maxWidth: 280, maxHeight: 300, borderRadius: 8, objectFit: 'cover', display: 'block' }} /></div>
                            )}
                          </>
                        ) : (
                          <>
                            {msg.type === 'text' ? (
                              <div className="bubble-me" style={{ borderRadius: 25, backgroundColor: '#fff', padding: '8px', maxWidth: 320, wordBreak: 'break-word' }}>{msg.content}</div>
                            ) : (
                              <div className="bubble-img" style={{ borderRadius: 12, backgroundColor: '#fff', padding: 6 }}><img src={msg.content} alt={`image-me-${i}`} style={{ maxWidth: 280, maxHeight: 300, borderRadius: 8, objectFit: 'cover', display: 'block' }} /></div>
                            )}
                            {userPic ? <img src={userPic} alt="me" className="msg-me-avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flex: '0 0 36px' }} /> : <div className="msg-me-avatar fallback" style={{ width: 36, height: 36, borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>Me</div>}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <ChatInput onSend={handleSend} />
                </>
              )}
            </div>
          ) : (
            <div className="cards-area" style={{ position: 'relative', width: 432, height: 560, textAlign: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span>Elfogytak a kártyák :c</span>
              </div>
              {cards.map((c, idx) => {
                const isTop = idx === 0
                return <Card key={c.id} id={c.id} imgSrc={c.imgSrc} name={c.name} age={c.age} description={c.description} style={{ top: idx * 8, zIndex: cards.length - idx }} onSwipe={handleSwipe} onDragProgress={isTop ? setDragProgress : undefined} />
              })}
            </div>
          )}
          <div id="green" className="overlay-green" style={{ opacity: greenOpacity }} />
        </div>
      </div>
    </div>
  )
}

export default App
