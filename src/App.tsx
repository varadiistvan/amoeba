import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from './Canvas';

interface AppProps extends React.HTMLAttributes<HTMLDivElement> {}

export const App = (props: AppProps) => {

  const parentRef = useRef<HTMLDivElement>(null)

  const [dimensions, setDimensions] = useState<{width: number, height: number}>({width: 0, height: 0})

  useEffect(() => {
    if(parentRef.current) {
      setDimensions({height: parentRef.current.offsetHeight, width: parentRef.current.offsetWidth})
    }
  }, [parentRef])

  return (
    <div {...props} ref={parentRef} >
      <Canvas {...dimensions} />
    </div>
  );
}
