'use client';

import { WhiteboardHandle } from './WhiteboardCanvas'
import { useRef } from 'react'
import { jsPDF } from 'jspdf';

type Props = {
  whiteboardRef: React.RefObject<WhiteboardHandle | null> ;
}

const handleDownloadImage = () => {
  const canvasEl = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvasEl) return;

  const image = canvasEl.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'whiteboard.png';
  link.href = image;
  link.click();
};

const handleDownloadPDF = () => {
  const canvasEl = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvasEl) return;

  const image = canvasEl.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvasEl.width, canvasEl.height],
  });

  pdf.addImage(image, 'PNG', 0, 0, canvasEl.width, canvasEl.height);
  pdf.save('whiteboard.pdf');
};

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
      <input
        style={{
          padding: '1px 1px',
          border: '1px solid #ccc',
          cursor: 'pointer'
        }}
        ref={colorInputRef}
        type="color"
        defaultValue="#000000"
        onChange={(e) => whiteboardRef.current?.setColor(e.target.value)}
      />
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.setPen()}>🖊️ Pen</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.setEraser()}>🩹 Eraser</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.undo()}>↩️ Undo</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.redo()}>↪️ Redo</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.clear()}>🗑️ Clear</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.addRect()}>⬛ Square</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.addCircle()}>⚪ Circle</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.addText()}>🔤 Text</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.toggleSelectMode(true)}>🖱️ Select</button>
      <button className='toolbar-button' onClick={() => whiteboardRef.current?.toggleSelectMode(false)}>✏️ Draw</button>
      <button className='toolbar-button' onClick={handleDownloadImage}>Export as Image</button>
      <button className='toolbar-button' onClick={handleDownloadPDF}>Export as PDF</button>
    </div>
  )
}

export default Toolbar
