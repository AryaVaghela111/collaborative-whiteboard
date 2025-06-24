import WhiteboardWrapper from '@/components/WhiteboardWrapper'
import { Suspense } from 'react'


export default function Home() {
  return (
     <main>
      <Suspense fallback={<p>Loading whiteboard...</p>}>
        <WhiteboardWrapper />
      </Suspense>
    </main>
  )
}
