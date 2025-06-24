'use client';

import {
  useRef,
  forwardRef
} from 'react';
import { fabric } from 'fabric';
import { useWhiteboardEffect } from './Whiteboard/useWhiteboardEffect';
import { useWhiteboardImperativeHandle } from './Whiteboard/useWhiteboardImperative';

declare module 'fabric' {
  interface Object {
    id?: string;
  }
}

export type WhiteboardHandle = {
  setColor: (color: string) => void;
  setEraser: () => void;
  setPen: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  addRect: () => void;
  addCircle: () => void;
  addText: () => void;
  toggleSelectMode: (enabled: boolean) => void;
};


const WhiteboardCanvas = forwardRef<WhiteboardHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<fabric.Object[][]>([]);
  const stepRef = useRef<number>(-1);
  const currentColorRef = useRef<string>('#000000');

  const roomId = window.location.pathname.split('/').pop() || null;
  const searchParams = new URLSearchParams(window.location.search)
  const mode = searchParams.get('mode') === 'view' ? 'view' : 'edit'

  useWhiteboardImperativeHandle(ref, fabricCanvasRef, historyRef, stepRef, currentColorRef);
  useWhiteboardEffect(canvasRef, fabricCanvasRef, roomId, mode);

  return <canvas ref={canvasRef} />;
});
WhiteboardCanvas.displayName = 'WhiteboardCanvas';
export default WhiteboardCanvas;