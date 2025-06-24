'use client';

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import Toolbar from './Toolbar'
import type { WhiteboardHandle } from './WhiteboardCanvas'
import { useSearchParams } from 'next/navigation';

const WhiteboardCanvas = dynamic(() => import('./WhiteboardCanvas'), {
  ssr: false,
})

const WhiteboardWrapper = () => {
  const whiteboardRef = useRef<WhiteboardHandle>(null)
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'view' ? 'view' : 'edit';

  return (
    <>
      {mode === 'edit' && <Toolbar whiteboardRef={whiteboardRef} />}
      <WhiteboardCanvas ref={whiteboardRef} />
    </>
  )
}

export default WhiteboardWrapper
