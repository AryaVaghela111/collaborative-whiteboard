'use client';

import { WhiteboardHandle } from './WhiteboardCanvas'
import { useRef } from 'react'

type Props = {
  whiteboardRef: React.RefObject<WhiteboardHandle | null> ;
}

const Toolbar = ({ whiteboardRef }: Props) => {
  const colorInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: '#f0f0f0',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 1000,
      }}
    >
      <button onClick={() => whiteboardRef.current?.setPen()}>🖊️ Pen</button>
      <button onClick={() => whiteboardRef.current?.setEraser()}>🩹 Eraser</button>
      <input
        ref={colorInputRef}
        type="color"
        defaultValue="#000000"
        onChange={(e) => whiteboardRef.current?.setColor(e.target.value)}
      />
      <button onClick={() => whiteboardRef.current?.undo()}>↩️ Undo</button>
      <button onClick={() => whiteboardRef.current?.redo()}>↪️ Redo</button>
      <button onClick={() => whiteboardRef.current?.clear()}>🗑️ Clear</button>
      <button onClick={() => whiteboardRef.current?.addRect()}>⬛ Square</button>
      <button onClick={() => whiteboardRef.current?.addCircle()}>⚪ Circle</button>
      <button onClick={() => whiteboardRef.current?.addText()}>🔤 Text</button>
    </div>
  )
}

export default Toolbar
