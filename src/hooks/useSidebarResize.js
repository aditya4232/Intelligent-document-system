import { useState, useRef, useEffect } from 'react'

const MIN_WIDTH = 220
const MAX_WIDTH = 480

/**
 * useSidebarResize
 * Provides a draggable sidebar width with mouse-event-based resizing.
 * Attach `startResize` to the resize-handle's onMouseDown.
 */
export function useSidebarResize(initialWidth = 300) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth)
  const isResizing = useRef(false)

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isResizing.current) return
      setSidebarWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX)))
    }
    const onMouseUp = () => {
      if (!isResizing.current) return
      isResizing.current = false
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const startResize = () => {
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
  }

  return { sidebarWidth, startResize }
}
