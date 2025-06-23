'use client';

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import Toolbar from './Toolbar'
import type { WhiteboardHandle } from './WhiteboardCanvas'

const WhiteboardCanvas = dynamic(() => import('./WhiteboardCanvas'), {
  ssr: false,
})

const WhiteboardWrapper = () => {
  const whiteboardRef = useRef<WhiteboardHandle>(null)

  return (
    <>
      <Toolbar whiteboardRef={whiteboardRef} />
      <WhiteboardCanvas ref={whiteboardRef} />
    </>
  )
}

export default WhiteboardWrapper
