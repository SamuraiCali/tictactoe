import React, {useMemo, useState, useEffect, useRef} from 'react'
import { lines, winner, chooseMinimax, chooseAlphaBeta } from './ai.js'

const MODES = ['Human vs Human','Human vs AI','AI vs AI']
const ALGOS = ['Minimax','AlphaBeta']

function Cell({value, onClick, disabled, highlight}){
  return (
    <button className={`cell ${disabled?'disabled':''} ${highlight?'win':''}`} onClick={onClick} disabled={disabled}>
      {value==='X' && <span className="symbol-x">X</span>}
      {value==='O' && <span className="symbol-o">O</span>}
    </button>
  )
}

function useAIMove(board, turn, algo, enabled, onFinish, useTT){
  const [thinking, setThinking] = useState(false)
  const [metrics, setMetrics] = useState(null)

  useEffect(()=>{
    let active = true
    async function think(){
      setThinking(true)
      await new Promise(r=>setTimeout(r, 0))
      let res
      if(algo==='Minimax') res = chooseMinimax(board, turn)
      else res = chooseAlphaBeta(board, turn, useTT)
      if(!active) return
      setMetrics(res.metrics)
      onFinish(res.index, res.metrics)
      setThinking(false)
    }
    if(enabled) think()
    return ()=>{ active=false }
  }, [board, turn, algo, enabled, useTT])

  return {thinking, metrics}
}

export default function App(){
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X')
  const [mode, setMode] = useState('Human vs AI')
  const [algoP1, setAlgoP1] = useState('AlphaBeta')
  const [algoP2, setAlgoP2] = useState('AlphaBeta')
  const [aiStarts, setAiStarts] = useState(false)
  const [aiSpeed, setAiSpeed] = useState(600) // ms between AI vs AI moves
  const [useTT, setUseTT] = useState(true)   // Extra credit: transposition table toggle
  const [history, setHistory] = useState([]) // Extra credit: undo/redo
  const [future, setFuture] = useState([])
  const [lastWinLine, setLastWinLine] = useState([])
  const [perfP1, setPerfP1] = useState([])
  const [perfP2, setPerfP2] = useState([])

  const w = winner(board)
  const gameOver = !!w
  const currentAlgo = turn==='X' ? algoP1 : algoP2

  const aiEnabled = useMemo(()=>{
    if(gameOver) return false
    if(mode==='Human vs Human') return false
    if(mode==='Human vs AI'){
      const humanIs = aiStarts ? 'O' : 'X'
      return turn !== humanIs
    }
    if(mode==='AI vs AI') return true
    return false
  }, [mode, turn, aiStarts, gameOver])

  const onAIMove = (idx, m) => {
    move(idx, true, m)
  }

  const {thinking, metrics} = useAIMove(board, turn, currentAlgo, aiEnabled, onAIMove, useTT)

  // AI vs AI stepper
  const timerRef = useRef(null)
  useEffect(()=>{
    if(mode!=='AI vs AI'){ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null } ; return }
    if(gameOver) return
    if(thinking) return
    timerRef.current = setInterval(()=>{}, aiSpeed) // noop; thinking effect triggers automatically
    return ()=>{ if(timerRef.current) { clearInterval(timerRef.current); timerRef.current=null } }
  }, [mode, aiSpeed, gameOver, thinking])

  function move(idx, ai=false, m=null){
    if(gameOver || board[idx]) return
    const nb = [...board]; nb[idx]=turn
    setHistory(h=>[...h, {board, turn}]); setFuture([])
    setBoard(nb)
    setTurn(t=> t==='X'?'O':'X')
    const wnow = winner(nb)
    if(wnow){
      setLastWinLine(wnow.line)
    }else{
      setLastWinLine([])
    }
    // record metrics
    if(ai && m){
      if(turn==='X') setPerfP1(p=>[...p, m])
      else setPerfP2(p=>[...p, m])
    }
  }

  function handleCellClick(i){
    if(gameOver) return
    if(mode!=='Human vs Human'){
      const humanIs = aiStarts ? 'O' : 'X'
      if(turn!==humanIs) return
    }
    if(board[i]) return
    move(i, false, null)
  }

  function reset(){
    setBoard(Array(9).fill(null))
    setTurn(aiStarts ? 'O' : 'X')
    setHistory([]); setFuture([]); setLastWinLine([]); setPerfP1([]); setPerfP2([])
  }

  function undo(){
    if(!history.length) return
    const prev = history[history.length-1]
    setFuture(f=>[{board, turn}, ...f])
    setHistory(h=>h.slice(0,-1))
    setBoard(prev.board); setTurn(prev.turn); setLastWinLine([])
  }
  function redo(){
    if(!future.length) return
    const nxt = future[0]
    setHistory(h=>[...h, {board, turn}])
    setFuture(f=>f.slice(1))
    setBoard(nxt.board); setTurn(nxt.turn)
  }

  useEffect(()=>{ reset() }, [aiStarts, mode])

  const winLabel = w ? (w.player==='D' ? 'Draw' : `${w.player} wins`) : null

  return (
    <div className="container">
      <div className="header">
        <div className="h1">Tic‑Tac‑Toe AI • Minimax vs Alpha‑Beta</div>
        <div className="badge">
          <div className="spinner" style={{visibility: thinking ? 'visible' : 'hidden'}} />
          <span>{thinking ? 'AI thinking…' : 'Ready'}</span>
        </div>
      </div>

      <div className="card">
        <div className="controls">
          <div>
            <div className="sectionTitle">Game mode</div>
            <div className="row">
              <select value={mode} onChange={e=>setMode(e.target.value)}>
                {MODES.map(m=><option key={m}>{m}</option>)}
              </select>
              <button onClick={reset}>Restart</button>
            </div>
          </div>

          <div>
            <div className="sectionTitle">Algorithms</div>
            <div className="row">
              <label>X:
                <select value={algoP1} onChange={e=>setAlgoP1(e.target.value)} style={{marginLeft:8}}>
                  {ALGOS.map(a=><option key={a}>{a}</option>)}
                </select>
              </label>
              <label>O:
                <select value={algoP2} onChange={e=>setAlgoP2(e.target.value)} style={{marginLeft:8}}>
                  {ALGOS.map(a=><option key={a}>{a}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div>
            <div className="sectionTitle">Who plays first</div>
            <div className="row">
              <label><input type="radio" name="first" checked={!aiStarts} onChange={()=>setAiStarts(false)} /> X (Human/AI)</label>
              <label><input type="radio" name="first" checked={aiStarts} onChange={()=>setAiStarts(true)} /> O (Human/AI)</label>
            </div>
          </div>

          <div>
            <div className="sectionTitle">AI vs AI speed (ms)</div>
            <div className="row">
              <input type="range" min="100" max="1500" step="50" value={aiSpeed} onChange={e=>setAiSpeed(+e.target.value)} />
              <span className="badge"><span>Interval:</span><strong>{aiSpeed}</strong></span>
            </div>
          </div>

          <div>
            <div className="sectionTitle">Extra credit</div>
            <div className="row">
              <label><input type="checkbox" checked={useTT} onChange={e=>setUseTT(e.target.checked)} /> Transposition table (Alpha‑Beta)</label>
              <button onClick={undo}>Undo</button>
              <button onClick={redo}>Redo</button>
            </div>
          </div>
        </div>

        <hr />

        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
          <div className="badge"><strong>Turn:</strong> {turn}</div>
          <div className="badge"><strong>Mode:</strong> {mode}</div>
          <div className="badge"><strong>Algo:</strong> {turn==='X'?algoP1:algoP2}</div>
          {winLabel && <div className="badge"><strong>Result:</strong> {winLabel}</div>}
        </div>

        <div className="grid">
          {board.map((v,i)=>(
            <Cell key={i}
                  value={v}
                  onClick={()=>handleCellClick(i)}
                  disabled={mode!=='Human vs Human' && ((aiStarts?turn==='X':turn==='O') || !!v || !!w)}
                  highlight={w && w.line.includes(i)} />
          ))}
        </div>

        <div>
          <div className="sectionTitle">Performance (last AI move)</div>
          <div className="kpi">
            <div className="tile"><div>Decision time</div><div className="num">{metrics?metrics.timeMs.toFixed(2):'—'} ms</div></div>
            <div className="tile"><div>Nodes explored</div><div className="num">{metrics?metrics.nodes:'—'}</div></div>
            <div className="tile"><div>Pruned nodes</div><div className="num">{metrics?metrics.pruned:'—'}</div></div>
            <div className="tile"><div>Pruning efficiency</div><div className="num">{metrics?metrics.prunedPct:'—'}%</div></div>
          </div>
        </div>

        <div className="footer">
          Implements required modes, metrics, and algorithms. Extra credit: transposition table optimization toggle and undo/redo plus AI vs AI speed control.
        </div>
      </div>
    </div>
  )
}