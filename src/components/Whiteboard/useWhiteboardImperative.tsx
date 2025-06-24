import { useImperativeHandle } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fabric } from 'fabric';
import socket from '@/lib/socket';
import type { WhiteboardHandle } from '../WhiteboardCanvas';

export function useWhiteboardImperativeHandle(
  ref: React.Ref<WhiteboardHandle>,
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>,
  historyRef: React.MutableRefObject<fabric.Object[][]>,
  stepRef: React.MutableRefObject<number>,
  currentColorRef: React.MutableRefObject<string>
) {
  const saveHistory = async () => {
  const canvas = fabricCanvasRef.current;
  if (!canvas) return;

  // 🧼 Remove redo steps if any (after undo)
  if (stepRef.current < historyRef.current.length - 1) {
    historyRef.current = historyRef.current.slice(0, stepRef.current + 1);
  }

  // ✅ Clone all canvas objects deeply
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
      currentColorRef.current = color;
      canvas.freeDrawingBrush.color = color;
    },
    setEraser: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = '#ffffff';
      canvas.freeDrawingBrush.width = 30;
    },
    setPen: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = currentColorRef.current;
      canvas.freeDrawingBrush.width = 4;
    },
    undo: async () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || stepRef.current <= 0) return;

      stepRef.current--;
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();

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
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();

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
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
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
        selectable: true,
        hasControls: true,
        lockScalingFlip: true,
      }) as fabric.Object & { id: string };
      rect.id = uuidv4();
      canvas.add(rect);
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
      text.enterEditing();
      text.selectAll();
      socket.emit('canvas:update', text.toObject());
      saveHistory();
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
    },
  }));
}
