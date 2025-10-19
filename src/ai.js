// Game helpers
export function lines() {
  return [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ]
}
export function winner(board){
  for(const [a,b,c] of lines()){
    if(board[a] && board[a]===board[b] && board[b]===board[c]) return {player: board[a], line:[a,b,c]}
  }
  if(board.every(Boolean)) return {player: 'D', line: []}
  return null
}
export function evaluate(board, ai, opp){
  const w = winner(board)
  if(!w) return null
  if(w.player==='D') return 0
  return w.player===ai ? 10 : -10
}
function empties(board){ const e=[]; for(let i=0;i<9;i++) if(!board[i]) e.push(i); return e }
function switchP(p){ return p==='X'?'O':'X' }

// Minimax with node counting
export function chooseMinimax(board, player){
  const ai = player, opp = switchP(player)
  let nodes=0
  const t0 = performance.now()
  function mm(b, turn){
    nodes++
    const sc = evaluate(b, ai, opp)
    if(sc!==null) return {score: sc}
    const moves = empties(b)
    if(turn===ai){
      let best={score:-Infinity, idx:null}
      for(const m of moves){
        b[m]=turn
        const res = mm(b, opp)
        b[m]=null
        if(res.score>best.score){ best={score:res.score, idx:m} }
      }
      return best
    }else{
      let best={score:Infinity, idx:null}
      for(const m of moves){
        b[m]=turn
        const res = mm(b, ai)
        b[m]=null
        if(res.score<best.score){ best={score:res.score, idx:m} }
      }
      return best
    }
  }
  const {idx, score} = mm([...board], player)
  const t1 = performance.now()
  return { index: idx, score, metrics: { algo:'Minimax', timeMs: +(t1-t0).toFixed(3), nodes, pruned: 0, prunedPct: 0 } }
}

// Alpha-Beta with pruning counts and optional transposition table
export function chooseAlphaBeta(board, player, useTT=false){
  const ai=player, opp=switchP(player)
  let nodes=0, pruned=0
  const t0 = performance.now()
  const TT = new Map()
  function key(b, turn){ return b.map(v=>v??'-').join('')+'|'+turn }
  function ab(b, turn, alpha, beta){
    nodes++
    const k = useTT ? key(b, turn) : null
    if(useTT && TT.has(k)) return TT.get(k)
    const sc = evaluate(b, ai, opp)
    if(sc!==null){ const r={score:sc, idx:null}; if(useTT) TT.set(k, r); return r }
    const moves = empties(b)
    if(turn===ai){
      let best={score:-Infinity, idx:moves[0]}
      for(const m of moves){
        b[m]=turn
        const res = ab(b, opp, alpha, beta)
        b[m]=null
        if(res.score>best.score){ best={score:res.score, idx:m} }
        alpha = Math.max(alpha, res.score)
        if(beta<=alpha){ pruned += 1; break }
      }
      if(useTT) TT.set(k, best)
      return best
    }else{
      let best={score:Infinity, idx:moves[0]}
      for(const m of moves){
        b[m]=turn
        const res = ab(b, ai, alpha, beta)
        b[m]=null
        if(res.score<best.score){ best={score:res.score, idx:m} }
        beta = Math.min(beta, res.score)
        if(beta<=alpha){ pruned += 1; break }
      }
      if(useTT) TT.set(k, best)
      return best
    }
  }
  const {idx, score} = ab([...board], player, -Infinity, Infinity)
  const t1 = performance.now()
  const prunedPct = nodes ? +( (pruned / nodes) * 100 ).toFixed(2) : 0
  return { index: idx, score, metrics: { algo:'AlphaBeta', timeMs: +(t1-t0).toFixed(3), nodes, pruned, prunedPct } }
}