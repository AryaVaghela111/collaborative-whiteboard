'use client';

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import socket from '@/lib/socket';
import { v4 as uuidv4 } from 'uuid';
import { fabric } from 'fabric';

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
    }) as fabric.Object & { id: string };

    canvas.add(rect);
    rect.id = uuidv4(); 
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveHistory(); 
    socket.emit('canvas:update', rect.toObject());
    },

    addCircle: () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const circle = Object.assign(new fabric.Circle({
        left: 150,
        top: 150,
        fill: '#ffffff',
        radius: 50,
        stroke: '#000',
        strokeWidth: 2,
        
    }), { id: uuidv4() });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    saveHistory(); 
    socket.emit('canvas:update', circle.toObject());
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
        socket.emit('canvas:update', text.toObject());

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
        if (!(path as any).id) {
          (path as any).id = uuidv4();
        }
        const pathData = path.toObject(['id']);
        socket.emit('canvas:update', pathData);
        saveHistory();
      }
    });

    canvas.on('object:modified', (event) => {
      const obj = event.target as fabric.Object & { id?: string };
      if (!obj?.id) return;
      const data = obj.toObject(['id']);
      socket.emit('canvas:update', data);
    });

    canvas.on('text:editing:exited', (e) => {
      const target = e.target as fabric.Textbox & { id?: string };
      if (target) {
        if (!target.id) {
          target.id = uuidv4();
        }
        socket.emit('canvas:update', target.toObject(['id']));
      }
    });

    socket.on('canvas:update', (data: any) => {
      if (!fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;

      fabric.util.enlivenObjects([data], (objects: fabric.Object[]) => {
        objects.forEach((obj) => {
          const id = (obj as any).id;
          if (!id) return;

          const existing = canvas.getObjects().find((o: any) => o.id === id);

          if (existing) {
            canvas.remove(existing);
          }

          canvas.add(obj);
        });
        canvas.renderAll();
      }, 'fabric');
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


