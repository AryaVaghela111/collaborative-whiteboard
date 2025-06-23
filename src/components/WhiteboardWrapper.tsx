'use client'

import dynamic from 'next/dynamic'

// Dynamically import the WhiteboardCanvas and disable SSR
const WhiteboardCanvas = dynamic(() => import('@/components/WhiteboardCanvas'), {
  ssr: false,
})

const WhiteboardWrapper = () => {
  return <WhiteboardCanvas />
}

export default WhiteboardWrapper
