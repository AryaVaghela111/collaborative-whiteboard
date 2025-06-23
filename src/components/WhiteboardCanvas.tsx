'use client';

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import { fabric } from 'fabric';

export type WhiteboardHandle = {
  setColor: (color: string) => void;
  setEraser: () => void;
  setPen: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

const WhiteboardCanvas = forwardRef<WhiteboardHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<fabric.Object[][]>([]);
  const stepRef = useRef<number>(-1);

  const saveHistory = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (stepRef.current < historyRef.current.length - 1) {
      historyRef.current.splice(stepRef.current + 1);
    }

    const clones = await Promise.all(
      canvas.getObjects().map(
        obj =>
          new Promise<fabric.Object>(resolve => {
            obj.clone((clone: fabric.Object) => resolve(clone));
          })
      )
    );

    historyRef.current.push(clones);
    stepRef.current++;
  };

  useImperativeHandle(ref, () => ({
    setColor: (color: string) => {
      const canvas = fabricCanvasRef.current;
      if (canvas?.isDrawingMode) {
        canvas.freeDrawingBrush.color = color;
      }
    },
    setEraser: () => {
      fabricCanvasRef.current?.freeDrawingBrush && (fabricCanvasRef.current.freeDrawingBrush.color = '#ffffff');
    },
    setPen: () => {
      fabricCanvasRef.current?.freeDrawingBrush && (fabricCanvasRef.current.freeDrawingBrush.color = '#000000');
    },
    undo: async () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || stepRef.current <= 0) return;

      stepRef.current--;
      canvas.clear().renderAll();

      const clones = await Promise.all(
        historyRef.current[stepRef.current].map(
          obj =>
            new Promise<fabric.Object>(resolve => {
              obj.clone((clone: fabric.Object) => resolve(clone));
            })
        )
      );

      clones.forEach(clone => canvas.add(clone));
    },
    redo: async () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || stepRef.current >= historyRef.current.length - 1) return;

      stepRef.current++;
      canvas.clear().renderAll();

      const clones = await Promise.all(
        historyRef.current[stepRef.current].map(
          obj =>
            new Promise<fabric.Object>(resolve => {
              obj.clone((clone: fabric.Object) => resolve(clone));
            })
        )
      );

      clones.forEach(clone => canvas.add(clone));
    },
    clear: async () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      canvas.clear().renderAll();
      canvas.backgroundColor = '#ffffff';
      await saveHistory();
    }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: '#ffffff'
    });

    canvas.setHeight(window.innerHeight);
    canvas.setWidth(window.innerWidth);

    fabricCanvasRef.current = canvas;

    canvas.on('path:created', () => {
      saveHistory();
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} />;
});

export default WhiteboardCanvas;
