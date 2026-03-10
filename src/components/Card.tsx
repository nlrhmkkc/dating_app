import React, { useRef, useState } from 'react'
import './Card.css'

type Props = {
  id: number
  imgSrc: string
  name: string
  age: number
  description: string
  onSwipe: (id: number, dir: 'left' | 'right') => void
  onDragProgress?: (progress: number) => void // -1 (full left) .. 0 .. 1 (full right)
  style?: React.CSSProperties
}

export default function Card({ id, imgSrc, name, age, description, onSwipe, onDragProgress, style }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const swipedRef = useRef<{ swiped: boolean; dir?: 'left' | 'right' }>({ swiped: false })
  const [transform, setTransform] = useState({ x: 0, y: 0, rot: 0, transition: '' })

  const threshold = 120
  const maxDistance = 240 // distance used to normalize drag progress (adjust sensitivity)

  const reportProgress = (dx: number) => {
    const p = Math.max(-1, Math.min(1, dx / maxDistance))
    onDragProgress?.(p)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (elRef.current) {
      elRef.current.setPointerCapture(e.pointerId)
    } else {
      ;(e.target as Element).setPointerCapture(e.pointerId)
    }
    startRef.current = { x: e.clientX, y: e.clientY }
    swipedRef.current = { swiped: false }
    setTransform((s) => ({ ...s, transition: '' }))
    reportProgress(0)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const rot = Math.max(-30, Math.min(30, dx / 10))
    setTransform({ x: dx, y: dy, rot, transition: '' })
    reportProgress(dx)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (elRef.current) {
      try {
        elRef.current.releasePointerCapture(e.pointerId)
      } catch {}
    } else {
      try {
        ;(e.target as Element).releasePointerCapture(e.pointerId)
      } catch {}
    }

    if (!startRef.current) return

    const dx = e.clientX - startRef.current.x
    const dir = dx > 0 ? 'right' : 'left'
    if (Math.abs(dx) > threshold) {
      const flyX = (dir === 'right' ? window.innerWidth : -window.innerWidth) * 1.2
      setTransform({ x: flyX, y: transform.y, rot: transform.rot, transition: 'transform 320ms ease' })
      swipedRef.current = { swiped: true, dir }
      // keep reporting progress during fly-out (optional) then parent will remove card;
      // ensure we reset after transition ends
      startRef.current = null
      return
    }

    setTransform({ x: 0, y: 0, rot: 0, transition: 'transform 200ms ease' })
    startRef.current = null
    reportProgress(0)
  }

  const onTransitionEnd = () => {
    if (swipedRef.current.swiped && swipedRef.current.dir) {
      onSwipe(id, swipedRef.current.dir)
      swipedRef.current = { swiped: false }
    }
    // ensure overlays reset when animation completes
    onDragProgress?.(0)
  }

  const styleObj: React.CSSProperties = {
    transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rot}deg)`,
    transition: transform.transition,
    ...style,
  }

  return (
    <div
      ref={elRef}
      className="card"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTransitionEnd={onTransitionEnd}
      style={styleObj}
    >
      <div className="cardContent">
        <img className="card-img" src={imgSrc} alt={name} draggable={false} />
        <h3>{name}</h3>
        <p>{age} years old</p>
        <p>{description}</p>
      </div>
    </div>
  )
}
