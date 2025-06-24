import { useEffect } from 'react';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import socket from '@/lib/socket';



export function useWhiteboardEffect(
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>,
  roomId: string | null,
  mode: 'edit' | 'view' = 'edit'
) {
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

    const isViewOnly = mode === 'view';
    canvas.isDrawingMode = !isViewOnly;
    canvas.selection = !isViewOnly;

    canvas.getObjects().forEach(obj => {
    obj.selectable = !isViewOnly;
    obj.evented = !isViewOnly;
    obj.hasControls = !isViewOnly;
    });

    const BACKEND_URL = 'https://collaborative-whiteboard-production-0ace.up.railway.app';

    if (roomId) {
      socket.emit('join-room', roomId);
      fetch(`${BACKEND_URL}/room/${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.canvasData && Object.keys(data.canvasData).length > 0) {
            canvas.loadFromJSON(data.canvasData, () => {
              canvas.renderAll();
              console.log('✅ Canvas loaded from DB');
            });
          }
        })
        .catch(err => console.error('❌ Failed to load canvas:', err));
    }

    canvas.on('path:created', (event) => {
      if (isViewOnly) return;
      const path = (event as unknown as { path: fabric.Path }).path;
      if (path) {
        const typedPath = path as fabric.Path & { id?: string };
        if (!typedPath.id) {
        typedPath.id = uuidv4();
        }
        const pathData = path.toObject(['id']);
        socket.emit('canvas:update', { roomId, data: pathData });
      }
    });

    canvas.on('object:modified', (event) => {
      if (isViewOnly) return;
      const obj = event.target as fabric.Object & { id?: string };
      if (!obj?.id) return;
      const data = obj.toObject(['id']);
      socket.emit('canvas:update', { roomId, data });
    });

    canvas.on('text:editing:exited', (e) => {
      if (isViewOnly) return;
      const target = e.target as fabric.Textbox & { id?: string };
      if (target) {
        if (!target.id) {
          target.id = uuidv4();
        }
        socket.emit('canvas:update', { roomId, data: target.toObject(['id']) });
      }
    });

    socket.on('canvas:update', (data: fabric.Object & { id?: string }) => {
      if (!fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;

      fabric.util.enlivenObjects([data], (objects: fabric.Object[]) => {
        objects.forEach((obj) => {
          const id = (obj as fabric.Object & { id?: string }).id;
          if (!id) return;

          const existing = canvas.getObjects().find((o: fabric.Object & { id?: string }) => o.id === id);

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
  }, [canvasRef, fabricCanvasRef, roomId]);
}
