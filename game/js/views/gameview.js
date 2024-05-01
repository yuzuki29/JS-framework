"use strict";
import { View } from "./view.js";
import { Ball } from "../game/ball.js";
import { Paddle } from "../game/paddle.js";
import { Block, HardBlock } from "../game/block.js";
import { Bar } from "../game/bar.js";
import { Sound } from "../sound.js";

export class GameView extends View {
  #ball = null;
  #paddle = null;
  #blocks = [];
  //パドルとボールの衝突音 
  #paddleBallSound = null;
  //ブロックとボールの衝突音 
  #blockBallSound = null;
  //ゲーム結果 
  resultMessage = "";
  //ステータスバー 
  #bar = null;

  constructor(context) {
    super(context);


    this.#paddle = new Paddle(context, 30, 460, 40, 4, 5);
    this.#ball = new Ball(context, 20, 440, 5, 2, 2);


    // ブロックを生成する
    this.#blocks = [
      new Block(context, 10, 40, 52, 20),
      new Block(context, 72, 40, 52, 20),
      new Block(context, 134, 40, 52, 20),
      new Block(context, 196, 40, 52, 20),
      new Block(context, 258, 40, 52, 20),
      new HardBlock(context, 10, 70, 52, 20),
      new Block(context, 72, 70, 52, 20),
      new Block(context, 134, 70, 52, 20),
      new HardBlock(context, 196, 70, 52, 20),
      new Block(context, 258, 70, 52, 20),
    ];
    // ステータスバーを生成する
    this.#bar = new Bar(context);

    // パドルとボールの衝突音を生成する
    this.#paddleBallSound = new Sound("././sound/爆発1.mp3");
    // ブロックとボールの衝突音を生成する
    this.#blockBallSound = new Sound("././sound/爆発2.mp3");
  }

  //プレイヤーのキーアクションを実行する 
  executePlayerAction(key) {
    if (key["ArrowLeft"] || key["Left"]) {
      // 左キーが押されたらパドルを左に移動する
      this.#paddle.dx = -this.#paddle.speed;
    } else if (key["ArrowRight"] || key["Right"]) {
      // 右キーが押されたらパドルを右に移動する
      this.#paddle.dx = this.#paddle.speed;
    } else {
      // キーが押されてない場合はパドルを停止する
      this.#paddle.dx = 0;
    }
  }

  //ボールと壁の衝突を確認する 
  #checkCollisionBallAndWall() {
    const canvasWidth = this.context.canvas.width;
    const canvasHeight = this.context.canvas.height;
    const ballX = this.#ball.x;
    const ballY = this.#ball.y;
    const ballRadius = this.#ball.radius;
    const ballDx = this.#ball.dx;
    const ballDy = this.#ball.dy;

    // ボールが左壁か右壁に衝突したらボールの向きを反転する
    if (
      ballX + ballDx < ballRadius ||
      canvasWidth - ballRadius < ballX + ballDx
    ) {
      this.#ball.dx *= -1;
      return;
    }

    //　ボールが上壁に衝突したらボールの向きを反転する
    if (ballY + ballDy < ballRadius + 20) {
      this.#ball.dy *= -1;
      return;
    }

    // ボールが下壁に衝突したらボールの向きを反転する
    // if (canvasHeight - ballRadius < ballY + ballDy) {
    //   this.#ball.dy *= -1;
    //   return;
    // }
  }

  //ボールとパドルの衝突を確認する 
  #checkCollisionBallAndPaddle() {
    const ballX = this.#ball.x;
    const ballY = this.#ball.y;
    const ballRadius = this.#ball.radius;
    const ballDx = this.#ball.dx;
    const ballDy = this.#ball.dy;
    const paddleX = this.#paddle.x;
    const paddleY = this.#paddle.y;
    const paddleWidth = this.#paddle.width;
    const paddleHeight = this.#paddle.height;

    // ボールとパドルが衝突したらボールを反射する
    if (paddleX - ballRadius < ballX + ballDx &&
      ballX + ballDx < paddleX + paddleWidth + ballRadius &&
      paddleY - ballRadius < ballY + ballDy &&
      ballY + ballDy < paddleY + paddleHeight + ballRadius) 
      {
      this.#ball.dy *= -1;
      // パドルとボールの衝突音を再生する
      this.#paddleBallSound.play();
    }
  }

  //パドルと壁の衝突を確認する 
  #checkCollisionPaddleAndWall() {
    const canvasWidth = this.context.canvas.width;
    const paddleX = this.#paddle.x;
    const paddleWidth = this.#paddle.width;
    const paddleDx = this.#paddle.dx;

    // パドルが左壁に衝突したらパドルの向きを反転する
    if (paddleX + paddleDx < 0) {
      this.#paddle.dx = 0;
      this.#paddle.x = 0;
      return;
    }

    // パドルが右壁に衝突したらパドルの向きを反転する
    if (this.context.canvas.width - paddleWidth < paddleX + paddleDx) {
      this.#paddle.dx = 0;
      this.#paddle.x = canvasWidth - paddleWidth;
      return;
    }
  }

  //ボールとブロックの衝突を確認する 
  #checkCollisionBallAndBlock() {
    const ballX = this.#ball.x;
    const ballY = this.#ball.y;
    const ballRadius = this.#ball.radius;
    const ballDx = this.#ball.dx;
    const ballDy = this.#ball.dy;

    this.#blocks.forEach((block) => {
      if (block.status) {
        const blockX = block.x;
        const blockY = block.y;
        const blockWidth = block.width;
        const blockHeight = block.height;

        // ボールとブロックが衝突したか検証する
        if (blockX - ballRadius < ballX + ballDx &&
          ballX + ballDx < blockX + blockWidth + ballRadius &&
          blockY - ballRadius < ballY + ballDy &&
          ballY + ballDy < blockY + blockHeight + ballRadius) {
          // ボールの向きを反転する
          this.#ball.dy *= -1;
          if (block instanceof HardBlock) {
            // HPを減らす
            block.hp--;
            if (block.hp <= 0) {
              // ブロックを非表示にする
              block.status = false;
              // スコアを加算する
              this.#bar.addScore(block.getPoint());
            }
          } else {
            // ブロックを非表示にする
            block.status = false;
            // スコアを加算する
            this.#bar.addScore(block.getPoint());
          }
          // ブロックとボールの衝突音を再生する
          this.#blockBallSound.play();
        }
      }
    });
  }

  //ゲームオーバーかどうか検証する 
  #isGameOver() {
    const ballY = this.#ball.y;
    const ballRadius = this.#ball.radius;
    const ballDy = this.#ball.dy;

    // ボールが下壁に衝突したか検証する
    const _isGameOver =
      this.context.canvas.height - ballRadius < ballY + ballDy;
    // ゲーム結果を設定する
    if (_isGameOver) {
      this.resultMessage = "ゲームオーバー";
    }
    return _isGameOver;
  }

  //ゲームクリアかどうかを検証する 
  #isGameClear() {
    // ブロックが全て非表示になっているか検証する
    const _isGameClear =
      this.#blocks.every((block) => block.status === false);
    // ゲーム結果を設定する
    if (_isGameClear) {
      this.resultMessage = "ゲームクリア";
    }
    return _isGameClear;
  }

  //更新する 
  update() {
    // ボールと壁の衝突を確認する
    this.#checkCollisionBallAndWall();
    // ボールとパドルの衝突を確認する
    this.#checkCollisionBallAndPaddle();
    // パドルと壁の衝突を確認する
    this.#checkCollisionPaddleAndWall();
    // ボールとブロックの衝突を確認する
    this.#checkCollisionBallAndBlock();

    // ゲームオーバーかどうか検証する
    if (this.#isGameOver() || this.#isGameClear()) {
      // ゲーム画面を非表示にする
      this.isVisible = false;
    }

    // ボールを移動する
    this.#ball.move();
    // パドルを移動する
    this.#paddle.move();
  }

  //描画する 
  draw() {
    // ボールを描画する
    this.#ball.draw();
    // パドルを描画する
    this.#paddle.draw();
    // ブロックを描画する
    this.#blocks.forEach((block) => block.draw());
    // ステータスバーを描画する
    this.#bar.draw();
  }
}
