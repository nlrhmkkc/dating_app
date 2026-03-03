import { useState } from 'react'

import { useEffect } from 'react'
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
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
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
  )
}

export default App
