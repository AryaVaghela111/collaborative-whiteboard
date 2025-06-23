'use client';

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import { fabric } from 'fabric';
import socket from '@/lib/socket';

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
  const currentColorRef = useRef<string>('#000000'); // default pen color 
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
        if (!canvas?.isDrawingMode) return;
        currentColorRef.current = color; // ✅ Save selected color
        canvas.freeDrawingBrush.color = color;
    },
    setEraser: () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = '#ffffff'; // white color
        canvas.freeDrawingBrush.width = 30; // ✅ make eraser bigger
    },
    setPen: () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = currentColorRef.current;  // or any current color
        canvas.freeDrawingBrush.width = 4;          // ✅ Reset to normal pen size
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
    },
    addRect: () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: '#ffffff',
        width: 100,
        height: 100,
        stroke: '#000',
        strokeWidth: 2,
        selectable: true,    // can be selected
        hasControls: true,   // shows resize handles
        lockScalingFlip: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveHistory(); 
    },

    addCircle: () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const circle = new fabric.Circle({
        left: 150,
        top: 150,
        fill: '#ffffff',
        radius: 50,
        stroke: '#000',
        strokeWidth: 2,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    saveHistory(); 
    },

    addText: () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const text = new fabric.IText('Enter text', {
            left: 200,
            top: 200,
            fontSize: 24,
            fill: currentColorRef.current,
            editable: true,
            hasControls: true,
            selectable: true,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();

        // ✅ Start editing immediately
        text.enterEditing();
        text.selectAll();

        saveHistory(); // if you want undo/redo support
    },
    toggleSelectMode: (enabled: boolean) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = !enabled;
    canvas.selection = enabled;

    canvas.getObjects().forEach(obj => {
        obj.selectable = enabled;
        obj.evented = enabled;
        obj.hasControls = enabled;
    });

    canvas.renderAll();
    }

  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: '#ffffff',
      selection: true,
    });

    canvas.setHeight(window.innerHeight);
    canvas.setWidth(window.innerWidth);

    fabricCanvasRef.current = canvas;

    canvas.on('path:created', (event) => {
        const path = (event as unknown as { path: fabric.Path }).path;
        if (path) {
            const pathData = path.toObject();
            socket.emit('canvas:update', pathData);
            saveHistory();
        }
        });

        socket.on('canvas:update', (data: any) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        fabric.util.enlivenObjects(
            [data],
            (objects: fabric.Object[]) => {
            objects.forEach((obj) => canvas.add(obj));
            canvas.renderAll();
            },
            'fabric'
        );
    });


    return () => {
      socket.off('canvas:update');
      canvas.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} />;
});

WhiteboardCanvas.displayName = 'WhiteboardCanvas';

export default WhiteboardCanvas;
