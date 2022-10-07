import { CSSProperties, FC, useEffect, useState, useRef } from 'react'
import './index.css'

const GAME_SIZE = 4

type Cell = {
  id: number
  value: number
  x: number
  y: number
}

type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'

const Game2048: FC = () => {
  const updateRef = useRef('')
  const indexArrRef = useRef<number[]>([])
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState<Cell[]>(handleGenerateGame())
  const score = Math.max(...game.map(cell => cell.value))
  const win = score >= 2048
  const lose = game.filter(cell => cell.value === 0).length === 0 && !win

  // generate random cells
  const handleGenerateCells = (count: number) => {
    indexArrRef.current = []

    while (indexArrRef.current.length < count) {
      const emptyCells = game.filter(cell => cell.value === 0)
      const index = handleGenerateRandomIndex(emptyCells.length)

      if (!indexArrRef.current.includes(index)) {
        indexArrRef.current.push(index)
      }
    }

    for (let i = 0; i < indexArrRef.current.length; i++) {
      setGame(prevGame => {
        prevGame[indexArrRef.current[i]].value = Math.random() >= 0.5 ? 2 : 4
        return [...prevGame]
      })
    }
  }

  // cDM
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    setTimeout(() => {
      handleGenerateCells(2)
      setLoading(false)
    }, 400)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (win || lose) return

    switch (e.key) {
      case 'ArrowUp': {
        const cells = handleRotate(game, e.key)
        handleMove(cells)
        break
      }
      case 'ArrowDown': {
        const cells = handleRotate(game, e.key).map(cell => cell.reverse())
        handleMove(cells)
        break
      }
      case 'ArrowLeft': {
        const cells = handleRotate(game, e.key)
        handleMove(cells)
        break
      }
      case 'ArrowRight': {
        const cells = handleRotate(game, e.key).map(cell => cell.reverse())
        handleMove(cells)
        break
      }
      default:
        break
    }
  }

  const handleMove = (cells: Cell[][]) => {
    cells.forEach(group => {
      for (let i = 1; i < group.length; i++) {
        const currentCell = group[i]
        let lastValidCell = null
        for (let j = i - 1; j >= 0; j--) {
          const prevCell = group[j]

          if (prevCell.value === 0 || prevCell.value === currentCell.value) {
            lastValidCell = prevCell
          } else {
            break
          }
        }

        if (lastValidCell !== null) {
          if (lastValidCell.value === currentCell.value) {
            lastValidCell.value += currentCell.value
            currentCell.value = 0
          } else {
            lastValidCell.value = currentCell.value
            currentCell.value = 0
          }
        }
      }
    })

    const result = cells.flat().sort((a, b) => a.id - b.id)

    setGame(prevGame => {
      const game = prevGame.map((el, index) => {
        el.value = result[index].value
        return {
          ...el,
        }
      })
      return [...game]
    })
  }

  // start new game
  const handleNewGame = () => {
    setLoading(true)
    updateRef.current = 'new-game'
  }

  // watch loading then create new game
  useEffect(() => {
    if (updateRef.current === 'new-game') {
      setGame(handleGenerateGame())

      setTimeout(() => {
        handleGenerateCells(2)
        setLoading(false)
        updateRef.current = ''
      }, 400)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <div className='wrapper'>
      <div className='game-board'>
        <div className='top-block'>
          <h3 className='title'>2048</h3>
          <div className='panel'>
            <div className='score'>Score: {score}</div>
            <button className='new-game-button' onClick={handleNewGame}>
              New Game
            </button>
          </div>
        </div>

        <div className='game-playground'>
          {/* draw playground grid */}
          {game.map((_, index) => {
            return <div key={index} className='grid' />
          })}

          {/* game play cell */}
          {game
            .filter(cell => cell.value !== 0)
            .map((cell, index) => {
              return (
                <div
                  key={index}
                  className='cell'
                  style={{ '--x': cell.x, '--y': cell.y } as CSSProperties}
                >
                  {cell.value}
                </div>
              )
            })}

          {loading && <div className='loading'>Loading...</div>}
          {win && <div className='win'>You Win!</div>}
          {lose && <div className='lose'>You Lose!</div>}
        </div>
      </div>
    </div>
  )
}

export default Game2048

const handleGenerateGame = () => {
  return Array.from({ length: GAME_SIZE * GAME_SIZE }, (_, index) => ({
    value: 0,
    x: index % GAME_SIZE,
    y: Math.floor(index / GAME_SIZE),
    id: index,
  }))
}

const handleGenerateRandomIndex = (len: number) => {
  return Math.floor(Math.random() * len)
}

const handleRotate = (cells: Cell[], direction: Direction) => {
  if (direction === 'ArrowUp' || direction === 'ArrowDown') {
    return cells.reduce((acc, cell) => {
      acc[cell.x] = acc[cell.x] || []
      acc[cell.x][cell.y] = cell
      return acc
    }, [] as Cell[][])
  }

  return cells.reduce((acc, cell) => {
    acc[cell.y] = acc[cell.y] || []
    acc[cell.y][cell.x] = cell
    return acc
  }, [] as Cell[][])
}
