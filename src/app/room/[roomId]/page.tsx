'use client';

import WhiteboardWrapper from '@/components/WhiteboardWrapper';
import { Suspense } from 'react';

export default function RoomPage() {
  return (
     <main>
      <Suspense fallback={<p>Loading whiteboard...</p>}>
        <WhiteboardWrapper />
      </Suspense>
    </main>
  );
}
