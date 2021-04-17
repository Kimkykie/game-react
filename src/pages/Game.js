import React, { Component } from "react";
import jwt_decode from "jwt-decode";

import { Character, Obstacle } from "../components/characters";
import axios from "../request";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 500;
const MAIN_CHAR_LENGTH = 30;

const randomNumberBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export class Game extends Component {

  constructor(props) {
    super(props);

    this.state = {
      gameTimer: 0,
      gamesCount: 0,
      highScore: 0
    };

    this.gameStarted = false;
    this.keysPressed = {};
    this.obstacles = [];
    this.gameLoop = null;
    document.body.addEventListener("keydown", (event) => {
      if (event.keyCode === 32 && !this.gameStarted) {
        this.startGame();
      }

      if (event.keyCode === 27 && this.gameStarted) {
        this.endGame(this.gameCanvas.getContext("2d"));
      }

      this.keysPressed[event.keyCode] = true;

      // Prevent default
      if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
      }
    });

    document.body.addEventListener("keyup", (event) => {
      delete this.keysPressed[event.keyCode];
    });
  }

  setCanvasRef = (el) => {
    this.gameCanvas = el;
  };

  async componentDidMount() {
    const tokenString = localStorage.getItem('token');
    const decodedToken = jwt_decode(tokenString)
    this.setState({
      highScore: decodedToken.highScore
    })
    await axios.get("/game/start").then((response) => {
      this.setState({gamesCount: response.data.gamesCount})
    });
    if (!this.gameStarted && this.state.gamesCount <= 10) {
      this.startGame();
    } else {
      const ctx = this.gameCanvas.getContext("2d");
      ctx.font = "30px Play";
      ctx.fillText("You have exhausted the maximum limit for today", 20, CANVAS_HEIGHT/2);
    }
  }
  resetCharacters = () => {
    this.mainCharacter = new Character({
      width: MAIN_CHAR_LENGTH,
      height: MAIN_CHAR_LENGTH,
      x: 0,
      y: CANVAS_HEIGHT / 2 - MAIN_CHAR_LENGTH / 2,
    });
    const ctx = this.gameCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    this.mainCharacter.draw(ctx);
  };
  createObstacle = () => {
    const obstacleWidth = 15;
    const placedY = randomNumberBetween(
      0,
      CANVAS_HEIGHT - (MAIN_CHAR_LENGTH + 40)
    );

    this.obstacles.push(
      new Obstacle({
        speed: 1,
        width: obstacleWidth,
        height: obstacleWidth,
        x: CANVAS_WIDTH,
        y: placedY,
      })
    );
  };

  startGame = () => {
    this.gameStarted = true;
    this.setState({ gameTimer: 0 });
    this.resetCharacters();
    this.gameLoop = setInterval(this.eventGameFrameLoop, 30);
  };

  eventGameFrameLoop = () => {
    if (!this.gameStarted) {
      return false;
    }
    this.setState({ gameTimer: this.state.gameTimer + 1 });

    const ctx = this.gameCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

    // Controls Player Movement
    this.playerController();

    this.mainCharacter.draw(ctx);

    const shouldGenerateObstacle = randomNumberBetween(0, 26) > 20;
    if (shouldGenerateObstacle) {
      this.createObstacle();
    }
    // setInterval(() => {
    //   this.createObstacle();
    // }, 5000);

    for (let i = 0; i < this.obstacles.length; i++) {
      const currentObs = this.obstacles[i];
      currentObs.move();
      if (
        currentObs.checkCollide(
          this.mainCharacter.x,
          this.mainCharacter.y,
          MAIN_CHAR_LENGTH,
          MAIN_CHAR_LENGTH
        )
      ) {
        this.endGame(ctx);
        return null;
      }
      currentObs.draw(ctx);
    }
    // this.obstacles = this.obstacles.filter(obs => this.checkInArena(obs.x, obs.y))
    return null;
  };

  moveCharacter = (dx, dy) => {
    this.mainCharacter.move(dx, dy);
  };

  playerController = () => {
    const playerMovement = 8;
    if (this.gameStarted) {
      if (this.keysPressed[37]) {
        if (this.mainCharacter.x >= 0) {
          this.moveCharacter(-playerMovement, 0);
        }
      }

      if (this.keysPressed[38]) {
        if (this.mainCharacter.y >= 0) {
          this.moveCharacter(0, -playerMovement);
        }
      }

      if (this.keysPressed[39]) {
        if (this.mainCharacter.x + MAIN_CHAR_LENGTH <= CANVAS_WIDTH) {
          this.moveCharacter(playerMovement, 0);
        }
      }

      if (this.keysPressed[40]) {
        if (this.mainCharacter.y + MAIN_CHAR_LENGTH <= CANVAS_HEIGHT) {
          this.moveCharacter(0, playerMovement);
        }
      }
    }
  };

  endGame = (ctx) => {
    clearInterval(this.gameLoop);
    this.gameStarted = false;
    this.obstacles = [];
    this.mainCharacter = null;
    ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    axios.post(`/game/save`, { score: this.state.gameTimer }).then(response => {
      this.setState({gamesCount: response.data.games})
    });
    this.setState({
      highScore: Math.max(this.state.highScore, this.state.gameTimer),
    })
  };

  restartGame = () => {
    if (this.state.gamesCount <= 10) {
      this.startGame();
    } else {
      const ctx = this.gameCanvas.getContext("2d");
      ctx.font = "30px Play";
      ctx.fillText("You have exhausted the maximum limit for today", 20, CANVAS_HEIGHT/2);
    }
  };

  render() {
    return (
      <div className="flex h-screen">
        <div className="mx-auto">
          <p className="text-center text-2xl mt-8 mb-8 font-bold text-green-700">
            High Score: {this.state.highScore}
          </p>
          <p className="text-center text-2xl mt-8 mb-8 font-bold text-green-700">
            No of Games played today: {this.state.gamesCount}
          </p>
          <div className="text-center text-xl bg-gray-700 text-white py-2 px-4">
            <div>{`Score: ${this.state.gameTimer}`}</div>
          </div>

          <canvas
            ref={this.setCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "#394B58",
              backgroundColor: "#FFF8E1",
            }}
          />
          <div className="flex justify-center">
            <button
              disabled={this.state.gamesCount > 10}
              className={`px-2 py-2 bg-purple-600 text-white mt-4 ${this.state.gamesCount > 10 && 'opacity-40 cursor-not-allowed'}`}
              onClick={() => {
                this.restartGame();
              }}
            >
              RESTART GAME
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
