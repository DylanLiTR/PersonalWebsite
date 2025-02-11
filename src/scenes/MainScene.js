import Phaser from "phaser";

import { DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, SPRITE_DIR } from "../components/constants";
import CloudManager from "../components/CloudManager";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    this.cloudImages = {
      // Background
      big_cloud: "Room/Big Cloud.png",
      otter_cloud: "Room/Otter Cloud.png",
      cinnamoroll_cloud: "Room/Cinnamoroll Cloud.png",
      small_cloud_1: "Room/Small Cloud 1.png",
      small_cloud_2: "Room/Small Cloud 2.png",
    }

    this.imageAssets = {
      // Icons
      aseprite: "Desk/Display/Aseprite.png",
      chrome: "Desk/Display/Chrome.png",
      discord: "Desk/Display/Discord.png",
      floorp: "Desk/Display/Floorp.png",
      leetcode: "Desk/Display/LeetCode.png",
      notion: "Desk/Display/Notion.png",
      spotify: "Desk/Display/Spotify.png",
      ticktick: "Desk/Display/TickTick.png",
    };

    this.drawOnStart = {
      // Background and room
      room: "Room/Foundation.png",

      // Furniture
      lamp: "Lamp.png",
      nightstand: "Nightstand.png",
      piano: "Piano/Piano.png",
      bench: "Piano/Bench.png",
      wardrobe: "Wardrobe.png",

      // Sports
      tennis_bag: "Tennis.png",

      // Bed
      bed: "Bed/Foundation.png",
      blanket: "Bed/Blanket.png",
      right_pillow: "Bed/Pillow Right.png",
      left_pillow: "Bed/Pillow Left.png",

      // Desk
      desk: "Desk/Desk.png",

      // Display
      monitor: "Desk/Display/Monitor.png",
      screen: "Desk/Display/Screen.png",
      laptop: "Desk/Laptop.png",
      // headphones: "Desk/Headphones.png",
      office_chair: "Desk/Chair.png",

      // Duo
      duolingo_s: "Bed/Duo/Shadow.png",
      duolingo: "Bed/Duo/Duo.png",

      // Pikachu
      pikachu_s: "Bed/Pikachu/Shadow.png",
      pikachu: "Bed/Pikachu/Fat Pikachu.png",

      // Characters
      dylan_s: "Me/Shadow.png",
      dylan: "Me/Me.png",

      hockey_bag: "Hockey/Bag.png",
      hockey_sticks: "Hockey/Sticks.png",
    };

    for (let key in this.cloudImages) {
      this.load.image(key, SPRITE_DIR + this.cloudImages[key]);
    }

    for (let key in this.imageAssets) {
      this.load.image(key, SPRITE_DIR + this.imageAssets[key]);
    }

    for (let key in this.drawOnStart) {
      this.load.image(key, SPRITE_DIR + this.drawOnStart[key]);
    }
  }

  create() {
    const { width, height } = this.scale;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.zoom = DEFAULT_ZOOM;
    let cam = this.cameras.main;
    cam.setZoom(this.zoom);
    cam.setBackgroundColor("#87CEEB"); // sky colour
    this.calcBounds();

    // Initialize CloudManager
    this.cloudManager = new CloudManager(this);

    // Create initial clouds
    for (let i = 0; i < 10; i++) {
      this.cloudManager.spawnCloud();
    }

    // Panning and inertia variables
    this.isDragging = false;
    this.dragStart = new Phaser.Math.Vector2();
    this.dragVelocity = new Phaser.Math.Vector2();
    this.inertiaDecay = 0.9; // Decay rate for inertia (0.9 = 10% slowdown per frame)

    // Enable panning with mouse or touch
    this.input.on("pointerdown", (pointer) => {
      this.isDragging = true;
      this.dragStart.set(pointer.x, pointer.y);
      this.dragVelocity.set(0, 0); // Reset velocity when starting to drag
    });

    this.input.on("pointerup", () => {
      this.isDragging = false;
    });

    this.input.on("pointermove", (pointer) => {
      if (this.isDragging && pointer.isDown) {
        const camera = this.cameras.main;

        // Calculate the delta based on the pointer movement
        const dragDelta = new Phaser.Math.Vector2(
          Phaser.Math.RoundTo((pointer.x - this.dragStart.x) / this.zoom, 0),
          Phaser.Math.RoundTo((pointer.y - this.dragStart.y) / this.zoom, 0)
        );

        // Update the camera scroll position
        camera.scrollX -= dragDelta.x;
        camera.scrollY -= dragDelta.y;

        // Update the drag velocity for inertia
        this.dragVelocity.set(dragDelta.x, dragDelta.y);

        // Update the drag start position to the current pointer position
        this.dragStart.set(pointer.x, pointer.y);
      }
    });

    // Zoom in/out with the mouse wheel or pinch gesture
    this.input.on("wheel", (pointer, dx, dy) => {
      if (dy > 0) this.changeZoom(0.9); // Zoom out
      if (dy < 0) this.changeZoom(1.1); // Zoom in
    });

    // Resize objects accordingly
    this.scale.on("resize", (gameSize) => this.resizeScene(gameSize));

    this.objects = {};
    for (const key in this.drawOnStart) {
      this.objects[key] = this.add.image(halfWidth, halfHeight, key).setOrigin(0.5).setDepth(1);
    }
  }

  update() {
    // Update clouds
    this.cloudManager.update();

    // Apply inertia if not dragging
    if (!this.isDragging && (this.dragVelocity.x !== 0 || this.dragVelocity.y !== 0)) {
      const camera = this.cameras.main;

      // Update camera scroll based on velocity
      camera.scrollX -= this.dragVelocity.x;
      camera.scrollY -= this.dragVelocity.y;

      // Decay the velocity over time
      this.dragVelocity.scale(this.inertiaDecay);
      this.dragVelocity.set(Math.trunc(this.dragVelocity.x), Math.trunc(this.dragVelocity.y));

      // Stop inertia when velocity is very small
      if (this.dragVelocity.length() < 0.01) {
        this.dragVelocity.set(0, 0);
      }
    }
  }

  // Zoom in/out function
  changeZoom(factor) {
    this.zoom *= factor;
    this.zoom = Phaser.Math.Clamp(this.zoom, MIN_ZOOM, MAX_ZOOM); // Limit zoom range

    this.cameras.main.setZoom(this.zoom);
    this.calcBounds();
  }
  
  calcBounds() {
    const ratio = (this.zoom - MIN_ZOOM) / this.zoom;
    const paddingLR = this.scale.width / 2 * ratio;
    const paddingTB = this.scale.height / 2 * ratio;
    this.cameras.main.setBounds(paddingLR, paddingTB, this.scale.width - paddingLR * 2, this.scale.height - paddingTB * 2);
    // console.log(paddingLR, paddingTB);
  }

  // Handle window resizing
  resizeScene(gameSize) {
    const { width, height } = gameSize;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Center the room to the new size
    for (const key in this.drawOnStart) {
      this.objects[key].setPosition(halfWidth, halfHeight);
    }
  }
}
