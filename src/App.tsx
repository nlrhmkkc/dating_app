import { useState, useEffect } from 'react'

interface Person{
  id: number;
  name: string;
  age: number;
  description: string;
  imagePath: string;
}

import Card from './components/Card'

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
  const [liked, setLiked] = useState<{name: string; imgSrc: string}[]>([])
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
    const personName = person?.name
    if (direction === 'right' && person) {
      setLiked((prev) => [...prev, { name: person.name, imgSrc: person.imgSrc }])
    }
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSelectMessage = (name: string) => {
    // for now just alert; can be replaced with navigation or opening chat
    alert(`Selected message thread with ${name}`)
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
      </div>
    </div>
  )
}

export default App
