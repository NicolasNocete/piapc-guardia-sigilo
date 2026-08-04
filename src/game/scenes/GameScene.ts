import Phaser from "phaser";
import {
  GUARD_START,
  GRID_HEIGHT,
  GRID_WIDTH,
  LAB_MAP,
  PLAYER_START,
  TILE_SIZE,
} from "../../application/simulation/labLevel";
import { calculateRoute } from "../../application/simulation/navigationDemo";
import { cellCenter, isWalkable, worldToCell, type GridPoint } from "../../domain/model/grid";
import type { SearchAlgorithm, SearchResult, SearchStatus } from "../../domain/navigation/search";

const PLAYER_SPEED = 190;
const STATUS_LABELS: Readonly<Record<SearchStatus, string>> = {
  success: "EXITO",
  unreachable: "INALCANZABLE",
  "invalid-start": "INICIO INVALIDO",
  "invalid-goal": "DESTINO INVALIDO",
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveUp!: Phaser.Input.Keyboard.Key;
  private moveDown!: Phaser.Input.Keyboard.Key;
  private moveLeft!: Phaser.Input.Keyboard.Key;
  private moveRight!: Phaser.Input.Keyboard.Key;
  private reset!: Phaser.Input.Keyboard.Key;
  private toggleAlgorithm!: Phaser.Input.Keyboard.Key;
  private navigationGraphics!: Phaser.GameObjects.Graphics;
  private targetMarker!: Phaser.GameObjects.Arc;
  private navigationHud!: Phaser.GameObjects.Text;
  private navigationAlgorithm: SearchAlgorithm = "astar";
  private navigationGoal: GridPoint = PLAYER_START;

  public constructor() {
    super("GameScene");
  }

  public create(): void {
    this.navigationAlgorithm = "astar";
    this.navigationGoal = PLAYER_START;
    this.cameras.main.setBackgroundColor("#10161c");
    this.drawGrid();

    const walls = this.physics.add.staticGroup();
    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        if (!isWalkable(LAB_MAP, { x, y })) {
          const center = cellCenter({ x, y }, TILE_SIZE);
          const wall = this.add.rectangle(center.x, center.y, TILE_SIZE, TILE_SIZE, 0x27333d);
          wall.setStrokeStyle(1, 0x3a4c58);
          walls.add(wall);
        }
      }
    }

    const spawn = cellCenter(PLAYER_START, TILE_SIZE);
    this.player = this.add.rectangle(spawn.x, spawn.y, 20, 20, 0xe5b454);
    this.player.setStrokeStyle(2, 0xffd98a);
    this.player.setDepth(4);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, walls);

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.cursors = keyboard.createCursorKeys();
    this.moveUp = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.moveDown = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.moveLeft = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.moveRight = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.reset = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.toggleAlgorithm = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.navigationGraphics = this.add.graphics().setDepth(2);
    const guardPosition = cellCenter(GUARD_START, TILE_SIZE);
    this.add
      .circle(guardPosition.x, guardPosition.y, 11, 0x6b8afd)
      .setStrokeStyle(2, 0xb9c5ff)
      .setDepth(4);
    this.targetMarker = this.add
      .circle(0, 0, 10, 0x000000, 0)
      .setStrokeStyle(3, 0x73c991)
      .setDepth(5);

    this.add
      .text(16, 14, "H2 / NAVEGACION", {
        color: "#9eb4c2",
        fontFamily: "monospace",
        fontSize: "14px",
      })
      .setDepth(10);

    this.navigationHud = this.add
      .text(GRID_WIDTH * TILE_SIZE - 16, 14, "", {
        align: "right",
        backgroundColor: "#10161ccc",
        color: "#d9e4ea",
        fontFamily: "monospace",
        fontSize: "13px",
        padding: { x: 8, y: 6 },
      })
      .setOrigin(1, 0)
      .setDepth(10);

    this.input.on("pointerdown", this.handlePointerDown, this);
    this.renderNavigation();
  }

  public update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.reset)) {
      this.scene.restart();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.toggleAlgorithm)) {
      this.navigationAlgorithm = this.navigationAlgorithm === "astar" ? "bfs" : "astar";
      this.renderNavigation();
    }

    const horizontal = Number(this.cursors.right.isDown || this.moveRight.isDown)
      - Number(this.cursors.left.isDown || this.moveLeft.isDown);
    const vertical = Number(this.cursors.down.isDown || this.moveDown.isDown)
      - Number(this.cursors.up.isDown || this.moveUp.isDown);
    const velocity = new Phaser.Math.Vector2(horizontal, vertical);

    if (velocity.lengthSq() > 0) {
      velocity.normalize().scale(PLAYER_SPEED);
    }

    this.playerBody.setVelocity(velocity.x, velocity.y);
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1b252d, 1);

    for (let x = 0; x <= GRID_WIDTH; x += 1) {
      graphics.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    }
    for (let y = 0; y <= GRID_HEIGHT; y += 1) {
      graphics.lineBetween(0, y * TILE_SIZE, GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    this.navigationGoal = worldToCell({ x: pointer.worldX, y: pointer.worldY }, TILE_SIZE);
    this.renderNavigation();
  }

  private renderNavigation(): void {
    const result = calculateRoute(
      LAB_MAP,
      GUARD_START,
      this.navigationGoal,
      this.navigationAlgorithm,
    );
    this.drawSearchResult(result);

    const targetPosition = cellCenter(this.navigationGoal, TILE_SIZE);
    this.targetMarker.setPosition(targetPosition.x, targetPosition.y);
    this.targetMarker.setStrokeStyle(3, result.status === "success" ? 0x73c991 : 0xe16969);

    const cost = result.totalCost === null ? "-" : String(result.totalCost);
    const algorithm = result.algorithm === "astar" ? "A*" : "BFS";
    this.navigationHud.setText([
      `${algorithm} / ${STATUS_LABELS[result.status]}`,
      `costo ${cost} | expandidos ${result.expandedNodes}`,
      `frontera maxima ${result.maximumFrontier}`,
    ]);
  }

  private drawSearchResult(result: SearchResult): void {
    this.navigationGraphics.clear();
    this.navigationGraphics.fillStyle(0x3b819c, 0.22);
    for (const point of result.explored) {
      this.navigationGraphics.fillRect(
        point.x * TILE_SIZE + 3,
        point.y * TILE_SIZE + 3,
        TILE_SIZE - 6,
        TILE_SIZE - 6,
      );
    }

    const firstPoint = result.path[0];
    if (!firstPoint) {
      return;
    }

    const firstCenter = cellCenter(firstPoint, TILE_SIZE);
    this.navigationGraphics.lineStyle(4, 0x62d0e8, 0.9);
    this.navigationGraphics.beginPath();
    this.navigationGraphics.moveTo(firstCenter.x, firstCenter.y);
    for (const point of result.path.slice(1)) {
      const center = cellCenter(point, TILE_SIZE);
      this.navigationGraphics.lineTo(center.x, center.y);
    }
    this.navigationGraphics.strokePath();
  }
}
