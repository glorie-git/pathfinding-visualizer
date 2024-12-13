const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

const rows = 20;
const cols = 20;
const cellSize = 20;

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

// Create grid (0 = empty, 1 = wall)
const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
const start = { x: 0, y: 0 };
const end = { x: cols - 10, y: rows - 12 };

grid[8][3] = 1;
grid[4][10] = 1;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === 1) {
        ctx.fillStyle = "black"; // Wall
      } else if (x === start.x && y === start.y) {
        ctx.fillStyle = "green"; // Start
      } else if (x === end.x && y === end.y) {
        ctx.fillStyle = "red"; // End
      } else {
        ctx.fillStyle = "white"; // Empty cell
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

drawGrid();

const bfs = (grid, start, end) => {
  const rows = grid.length;
  const cols = grid[0].length;

  const queue = [start];
  const cameFrom = {};
  const visited = new Set();

  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      ctx.fillStyle = "orange"; // Path color
      ctx.fillRect(
        neighbor.x * cellSize,
        neighbor.y * cellSize,
        cellSize,
        cellSize
      );
      if (
        neighbor.x < 0 ||
        neighbor.x >= cols ||
        neighbor.y < 0 ||
        neighbor.y >= rows ||
        grid[neighbor.y][neighbor.x] === 1 ||
        visited.has(`${neighbor.x},${neighbor.y}`)
      ) {
        continue;
      }

      queue.push(neighbor);
      visited.add(`${neighbor.x},${neighbor.y}`);
      cameFrom[`${neighbor.x},${neighbor.y}`] = current;
    }
  }

  return [];
};

const aStar = (grid, start, end) => {
  const rows = grid.length;
  const cols = grid[0].length;

  const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  const openSet = [start];
  const cameFrom = {};

  const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  gScore[start.y][start.x] = 0;

  const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  fScore[start.y][start.x] = heuristic(start, end);

  while (openSet.length > 0) {
    let current = openSet.reduce((a, b) =>
      fScore[a.y][a.x] < fScore[b.y][b.x] ? a : b
    );

    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }

    openSet.splice(openSet.indexOf(current), 1);

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      ctx.fillStyle = "orange"; // Path color
      ctx.fillRect(
        neighbor.x * cellSize,
        neighbor.y * cellSize,
        cellSize,
        cellSize
      );
      if (
        neighbor.x < 0 ||
        neighbor.x >= cols ||
        neighbor.y < 0 ||
        neighbor.y >= rows ||
        grid[neighbor.y][neighbor.x] === 1
      ) {
        continue;
      }

      const tentativeGScore = gScore[current.y][current.x] + 1;

      if (tentativeGScore < gScore[neighbor.y][neighbor.x]) {
        cameFrom[`${neighbor.x},${neighbor.y}`] = current;
        gScore[neighbor.y][neighbor.x] = tentativeGScore;
        fScore[neighbor.y][neighbor.x] =
          tentativeGScore + heuristic(neighbor, end);

        if (!openSet.some((n) => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
};

function reconstructPath(cameFrom, current) {
  const path = [];
  while (current) {
    path.unshift(current);
    current = cameFrom[`${current.x},${current.y}`];
  }
  return path;
}

function visualizePath(path) {
  for (const cell of path) {
    ctx.fillStyle = "blue"; // Path color
    ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
  }
}

document.getElementById("runButton").addEventListener("click", () => {
  const algorithm = document.getElementById("algorithmSelect").value;

  let path = [];
  if (algorithm === "BFS") {
    path = bfs(grid, start, end);
  } else if (algorithm === "A*") {
    path = aStar(grid, start, end);
  }

  drawGrid();
  visualizePath(path);
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  if (grid[y][x] === 0) {
    grid[y][x] = 1; // Set wall
  } else {
    grid[y][x] = 0; // Remove wall
  }

  drawGrid();
});
