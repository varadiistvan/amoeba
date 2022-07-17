import React, { useEffect, useRef, useState } from 'react'

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  width: number,
  height: number
}

enum Player {
  "o",
  "x"
} 

type Coordinates = {x: number, y: number}

type Win = {coords: Coordinates, type: "diag1" | "diag2" | "vert" | "horiz"}

const cuccMap = new Map<string, Player>()

// for(let i = 0; i < 200000; i++) {
//   const coordinates: Coordinates = {x: Math.floor(Math.random()*200) - 100, y: Math.floor(Math.random()*200)-100}
//   cuccMap.set(JSON.stringify(coordinates), Player.x)
// }

export const Canvas = (props: CanvasProps) => {

  const [displacement, setDisplacement] = useState<Coordinates>({x: 0, y: 0})
  
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const [startPos, setStartPos] = useState<Coordinates | null>(null)

  const [turn, setTurn] = useState<number>(0)

  const [wins, setWins] = useState<Win[]>([])

  const toggleTurn = () => {
    setTurn(old => -old+1)
  }
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const minDist = Math.min(props.width, props.height)/100

  const mouseDown = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    if(startPos == null) {
      setStartPos({x: ev.pageX, y: ev.pageY})
    }
  }

  const mouseMove = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    if(isDragging) {
      setDisplacement(old => ({x: old.x - ev.movementX/window.devicePixelRatio, y: old.y - ev.movementY/window.devicePixelRatio}))
    }
    else if(startPos && (Math.abs(ev.pageX - startPos.x) > minDist || Math.abs(ev.pageY - startPos.y) > minDist)) {
      setIsDragging(true)
      setDisplacement(old => ({
        x: old.x + (ev.pageX - startPos.x)/window.devicePixelRatio,
        y: old.y + (ev.pageY - startPos.y)/window.devicePixelRatio
      }))
    }
  }

  const mouseUp = (ev: React.MouseEvent<HTMLCanvasElement>) => {

    setStartPos(null)

    if(!isDragging) {
      const coordinates: Coordinates = {x: Math.floor((ev.clientX/window.devicePixelRatio+displacement.x)/20), y: Math.floor((ev.clientY/window.devicePixelRatio+displacement.y)/20)}

      const key = JSON.stringify(coordinates)

      if(cuccMap.get(key) === undefined) {
        cuccMap.set(key, turn)
        toggleTurn()
      }

      checkWin()

    }
    else {
      setIsDragging(false)
    }
    
  }

  const drawFasz = (canvas: HTMLCanvasElement | null, context: CanvasRenderingContext2D | null | undefined) => {

    if(!canvas || !context) return

    context?.setTransform(1, 0, 0, 1, 0, 0)
    context?.clearRect(0, 0, canvas?.width ?? 1000, canvas?.height ?? 1000)
    context?.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)

    context?.beginPath()
    
    for(let x = -displacement.x%20; x < props.width; x += 20) {
      context.moveTo(x, 0)
      context.lineTo(x, props.height)
    }

    for(let y = -displacement.y%20; y < props.height; y += 20) {
      context.moveTo(0, y)
      context.lineTo(props.width, y)
    }

    context.strokeStyle = "black"
    context.stroke()
    
    for(const [key, value] of cuccMap) {
      context.beginPath()
      const coordinates: Coordinates = JSON.parse(key)
      const topLeft: Coordinates = {x: Math.floor(displacement.x/20), y: Math.floor(displacement.y/20)}
      const botRight: Coordinates = {x: Math.floor((displacement.x + props.width/window.devicePixelRatio)/20), y: Math.floor((displacement.y + props.height/window.devicePixelRatio)/20)}
      if(topLeft.x - 1 <= coordinates.x && botRight.x >= coordinates.x && topLeft.y - 1 <= coordinates.y && botRight.y >= coordinates.y) {
        if(value === Player.o) {
          context.arc((coordinates.x * 20 - displacement.x) + 10, (coordinates.y * 20 - displacement.y) + 10, 8, 0, 2*Math.PI)
        }
        else {
          context.moveTo((coordinates.x * 20 - displacement.x)+2, (coordinates.y * 20 - displacement.y)+2)
          context.lineTo((coordinates.x * 20 - displacement.x)+18, (coordinates.y * 20 - displacement.y)+18)
          context.moveTo((coordinates.x * 20 - displacement.x)+18, (coordinates.y * 20 - displacement.y)+2)
          context.lineTo((coordinates.x * 20 - displacement.x)+2, (coordinates.y * 20 - displacement.y)+18)
        }
        
      }
      context.stroke()
    }

    context.strokeStyle = "red"
    context.beginPath()

    for(const win of wins) {

      switch(win.type) {
        case "diag1": {

          context.moveTo((win.coords.x-2)*20 - displacement.x +7, (win.coords.y-2)*20 - displacement.y +7)
          context.lineTo((win.coords.x+3)*20 - displacement.x -7, (win.coords.y+3)*20 - displacement.y -7)

          break
        }
        case 'diag2': {

          context.moveTo((win.coords.x-2)*20 - displacement.x +7, (win.coords.y+3)*20 - displacement.y -7)
          context.lineTo((win.coords.x+3)*20 - displacement.x -7, (win.coords.y-2)*20 - displacement.y +7)

          break
        }
        case 'vert': {

          context.moveTo((win.coords.x)*20 - displacement.x + 10, (win.coords.y-2)*20 - displacement.y +5)
          context.lineTo((win.coords.x)*20 - displacement.x + 10, (win.coords.y+3)*20 - displacement.y -5)

          break
        }
        case 'horiz': {

          context.moveTo((win.coords.x-2)*20 - displacement.x +5, (win.coords.y)*20 - displacement.y + 10)
          context.lineTo((win.coords.x+3)*20 - displacement.x -5, (win.coords.y)*20 - displacement.y + 10)

          break
        }
      }
      
    }

    context.stroke()  


  }
  
  useEffect(() => {

    if(!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    drawFasz(canvas, context)

  })

  const checkWin = () => {

    let win = false;

    for(const [key, value] of cuccMap) {
      const coordinates: Coordinates = JSON.parse(key)
      //diagonal 1
      if(
        cuccMap.get(JSON.stringify({x: coordinates.x-1, y: coordinates.y-1})) === value && 
        cuccMap.get(JSON.stringify({x: coordinates.x-2, y: coordinates.y-2})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x+1, y: coordinates.y+1})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x+2, y: coordinates.y+2})) === value
      ) {
        if(!win) {
          alert("player " + value + " wins")
          win = true
        }

        setWins(old => [...old, {coords: coordinates, type: "diag1"}])

      }

      //diagonal 2
      if(
        cuccMap.get(JSON.stringify({x: coordinates.x-1, y: coordinates.y+1})) === value && 
        cuccMap.get(JSON.stringify({x: coordinates.x-2, y: coordinates.y+2})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x+1, y: coordinates.y-1})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x+2, y: coordinates.y-2})) === value
      ) {
        if(!win) {
          alert("player " + value + " wins")
          win = true
        }
        setWins(old => [...old, {coords: coordinates, type: "diag2"}])

      }

      //vertical
      if(
        cuccMap.get(JSON.stringify({x: coordinates.x, y: coordinates.y+1})) === value && 
        cuccMap.get(JSON.stringify({x: coordinates.x, y: coordinates.y+2})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x, y: coordinates.y-1})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x, y: coordinates.y-2})) === value
      ) {
        if(!win) {
          alert("player " + value + " wins")
          win = true
        }
        setWins(old => [...old, {coords: coordinates, type: "vert"}])

      }

      //horizontal
      if(
        cuccMap.get(JSON.stringify({x: coordinates.x+1, y: coordinates.y})) === value && 
        cuccMap.get(JSON.stringify({x: coordinates.x+2, y: coordinates.y})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x-1, y: coordinates.y})) === value &&
        cuccMap.get(JSON.stringify({x: coordinates.x-2, y: coordinates.y})) === value
      ) {
        if(!win) {
          alert("player " + value + " wins")
          win = true
        }
        setWins(old => [...old, {coords: coordinates, type: "horiz"}])

      }
    }

  }

  return <>
    <button style={{position: 'absolute'}} onClick={() => setDisplacement({x: 0, y: 0})}>reset</button>
    <canvas ref={canvasRef} {...props} style={{...props.style, cursor: "pointer"}} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove} />
  </>
}