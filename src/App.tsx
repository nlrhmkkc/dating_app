import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

interface Person{
  id: number;
  name: string;
  age: number;
  description: string;
  imagePath: string;
}
import Card from './components/Card'

function App() {
  const [cards, setCards] = useState([
    { id: 1, name: 'Alice', imgSrc: 'https://randomuser.me/api/portraits/women/1.jpg', age: 25, description: 'Loves hiking and outdoor activities.' },
    { id: 2, name: 'Bob', imgSrc: 'https://randomuser.me/api/portraits/men/2.jpg', age: 30, description: 'Avid reader and coffee enthusiast.' },
    { id: 3, name: 'Carol', imgSrc: 'https://randomuser.me/api/portraits/women/3.jpg', age: 28, description: 'Passionate about art and music.' },
  ])

  const handleSwipe = (id: number, direction: 'left' | 'right') => {
    
    alert("swiped: "+direction)

    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>

    </>
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
