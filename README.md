# Tic‑Tac‑Toe AI: Minimax vs Alpha‑Beta

Web app that compares Minimax and Alpha‑Beta pruning on Tic‑Tac‑Toe. Built with React and Vite. Designed to meet the assignment’s game modes, algorithms, performance visualization, and UI requirements. Includes extra credit features.

## Core features
- **Modes**: Human vs Human, Human vs AI, AI vs AI (auto‑play with step visualization).
- **Algorithms**: Minimax and Alpha‑Beta. Select per side. Choose who plays first.
- **Metrics**: Decision time, nodes explored, pruned nodes and pruning efficiency (Alpha‑Beta). Shown live when the AI moves.
- **UI**: Clickable highlights, distinct X/O styling, current state, selected algorithms, controls to restart/switch modes.
- **Controls**: Restart, switch algorithms, switch game mode.

## Extra credit
- **Transposition table toggle** for Alpha‑Beta to demonstrate further node reduction.
- **AI vs AI speed control** (pause-like behavior by increasing interval).
- **Undo/Redo** for user experimentation.

## Run locally
```bash
npm install
npm run dev
# visit the printed localhost URL
```
Build a static site:
```bash
npm run build
# serve dist/
```

## Deploy to AWS Amplify Hosting (from GitHub)
1. Push this folder to a GitHub repo.
2. In Amplify Hosting, connect the repo and select the branch.
3. Use the following build settings or leave defaults for a Vite app.

### amplify.yml
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    appRoot: /
```

## Submission checklist
- `README.md` included.
- Complete source code in `src/` with CSS and JS assets.
- **Executable**: open `index.html` after `npm run build` (outputs to `dist/`) or run `npm run dev`.
- **Dependencies**: declared in `package.json`.

## Notes on evaluation function
- Win = +10 for the AI, loss = −10, draw = 0 as required.
- Depth can be added if desired; current version is standard scoring.

## License
MIT