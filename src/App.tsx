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
    alert(`You swiped ${direction} on ${personName}`)
    if (direction === 'right' && person) {
      setLiked((prev) => [...prev, { name: person.name, imgSrc: person.imgSrc }])
    }
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>
      <div style={{ position: 'relative', width: 360, height: 560, margin: '40px auto' }}>
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
      <div style={{ margin: '20px auto', width: 360 }}>
        <h4>Üzenetek</h4>
        {liked.length === 0 ? (
          <p>Nincs még jobbra húzott személy.</p>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {liked.map((p, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
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
                <div style={{ fontSize: '0.8rem' }}>{p.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default App
