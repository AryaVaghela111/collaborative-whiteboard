'use client'

import { useEffect, useRef } from 'react'
import  {fabric}  from 'fabric'


const WhiteboardCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: '#ffffff',
    })

    fabricCanvasRef.current = canvas

    // Resize canvas
    canvas.setHeight(window.innerHeight)
    canvas.setWidth(window.innerWidth)

    // Cleanup on unmount
    return () => {
      canvas.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} />
}

export default WhiteboardCanvas
