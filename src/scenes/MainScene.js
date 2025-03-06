import Phaser from "phaser";

import { DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, ROOM_SIZE, MINIMAP_XOFFSET, MINIMAP_YOFFSET } from "../components/constants";
import CloudManager from "../components/CloudManager";
import { trimTo } from "../components/utils"
import AnimationManager from "../components/AnimationManager";
import SpeechBubble from "../components/SpeechBubble";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.json('assets', '/src/assets/sprites/sprites.json');
  
    this.load.on('filecomplete-json-assets', () => {
      const assets = this.cache.json.get('assets');
      assets.images.forEach((asset) => {
        this.load.image(asset.key, asset.path);
      });
  
      // Load speech bubble
      this.load.image("bubble", "/src/assets/sprites/speech_bubble/bubble.png");
  
      this.load.start();
    });
  
    this.load.on("progress", (progress) => {
      this.game.events.emit("progress", progress);
    });
  
    this.load.once("complete", () => {
      this.game.events.emit("loadingComplete");
    });
  }

  create() {
    this.isLoading = true;
    let cam = this.cameras.main;
    cam.setBackgroundColor("#87CEEB"); // sky colour
    cam.setScroll(-cam.width / 2, -cam.height / 2);
    this.calcBounds();

    // Initialize CloudManager
    this.cloudManager = new CloudManager(this);

    // Create initial clouds
    for (let i = 0; i < 10; i++) {
      this.cloudManager.spawnCloud();
    }

    // Resize objects accordingly
    this.initialWidth = this.scale.width;
    this.initialHeight = this.scale.height;
    this.scale.on("resize", () => this.resizeScene());

    const assets = this.cache.json.get('assets');
    const xOffset = -ROOM_SIZE / 2;
    const yOffset = -ROOM_SIZE / 2;

    // Add images or sprites to the scene
    this.objects = {};
    this.offsets = [];
    assets.images.forEach((asset) => {
      if (!asset.draw) return;
      if (asset.type === 'static') {
        this.objects[asset.key] = this.add.image(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key).setOrigin(0).setDepth(1);
        this.offsets.push({ key: asset.key, xBound: asset.boundingBox.x, yBound: asset.boundingBox.y });
      } else if (asset.type === 'sprite') {
        const trimmedKey = trimTo(asset.key, '_');
        this.objects[trimmedKey] = this.add.sprite(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key).setOrigin(0).setDepth(1).setInteractive();
        this.hoverOutline(trimmedKey);
        this.offsets.push({ key: trimmedKey, xBound: asset.boundingBox.x, yBound: asset.boundingBox.y });
      }
    });

    // Initialize AnimationManager
    this.animationManager = new AnimationManager(this);

    const duoTextures = [{ texture: 'duo_sprite', duration: 10000 }, { texture: 'duo_right', duration: 5000 }];
    this.animationManager.addSprite(this.objects['duo'], duoTextures);

    this.createMinimap();
    setTimeout(() => {
      this.drawLoadingScreen();
    }, 1000);

    this.speechBubble = new SpeechBubble(this, this.objects['npc'].x, this.objects['npc'].y - 10);
    this.speechBubble.addText("Hi, my name is Dylan and welcome to my website! Feel free to look around and ask me any questions.");
  }

  update() {
    // Update clouds
    this.cloudManager.update();
    
    this.updateMinimap();
    if (!this.isLoading) {
      this.applyIntertia();
    }
  }

  drawLoadingScreen() {
    // Add a white screen covering the entire scene
    const loadingScreen = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffffff).setDepth(100);

    // Fade out the white screen
    this.tweens.add({
      targets: loadingScreen,
      alpha: 0, // Fade to transparent
      duration: 2000,
      ease: "Linear",
    });

    this.cameras.main.zoomTo(DEFAULT_ZOOM, 3000, "Power2", true, (camera, progress) => {
      if (progress === 1) {
        loadingScreen.destroy();

        this.zoom = DEFAULT_ZOOM;
        let cam = this.cameras.main;
        cam.setScroll(-cam.width / 2, -cam.height / 2);
        cam.setZoom(this.zoom);
        this.calcBounds();

        // Enable camera controls
        this.enablePanning();
        this.enableZooming();
        this.isLoading = false;
      }
    });
  }

  enableZooming() {
    // Zoom in/out with the mouse wheel or pinch gesture
    this.input.on("wheel", (pointer, dx, dy) => {
      if (dy > 0) this.changeZoom(0.9); // Zoom out
      if (dy < 0) this.changeZoom(1.1); // Zoom in
    });
  }

  enablePanning() {
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
  }

  applyIntertia() {
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
    const scaledWidth = this.cameras.main.width / this.zoom;
    const scaledHeight = this.cameras.main.height / this.zoom;
    this.cameras.main.setBounds(-scaledWidth, -scaledHeight, scaledWidth * 2, scaledHeight * 2);
    // console.log(paddingLR, paddingTB);
  }

  // Handle window resizing
  resizeScene() {
    const xOffset = - ROOM_SIZE / 2;
    const yOffset = - ROOM_SIZE / 2;

    // Center the room to the new size
    this.offsets.forEach((obj) => {
      this.objects[obj.key].setPosition(xOffset + obj.xBound, yOffset + obj.yBound);
    });
    this.calcBounds();
  }

  hoverOutline(spriteName) {
    var prevTexture = spriteName + '_sprite';
    this.objects[spriteName].on('pointerover', () => {
      prevTexture = this.objects[spriteName].texture.key;
      this.animationManager.pauseSprite(this.objects[spriteName]);
      this.objects[spriteName].setTexture(spriteName + '_hover'); // Change to hover image
      this.objects[spriteName].x -= 1;
      this.objects[spriteName].y -= 1;
      this.input.setDefaultCursor('pointer'); // Change cursor to pointer
    });

    // Revert cursor and sprite texture when hover ends
    this.objects[spriteName].on('pointerout', () => {
      this.objects[spriteName].setTexture(prevTexture); // Revert to previous image
      this.objects[spriteName].x += 1;
      this.objects[spriteName].y += 1;
      this.input.setDefaultCursor('default'); // Revert cursor to default
      this.animationManager.resumeSprite(this.objects[spriteName]);
    });
  }

  createMinimap() {
    const scale = 8;
    const zoom = MIN_ZOOM / 16;
    this.minimap = this.cameras.add(MINIMAP_XOFFSET, MINIMAP_YOFFSET, this.cameras.main.width / scale, this.cameras.main.height / scale).setZoom(zoom).setName('mini');
    this.minimap.setBackgroundColor(0x76BDDA);
    this.minimap.scrollX = -this.minimap.width / 2;
    this.minimap.scrollY = -this.minimap.height / 2;

    this.cameraRect = this.add.rectangle(0, 0, 0, 0, 0xffffff, 0.5)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);

    this.cameras.main.ignore(this.cameraRect);
  }

  updateMinimap() {
    const main = this.cameras.main;
    const mini = this.minimap;

    // Calculate the position and size of the rectangle
    const rectX = main.scrollX + main.width / 2 + mini.width / 2 - MINIMAP_XOFFSET;
    const rectY = main.scrollY + main.height / 2 + mini.height / 2 - MINIMAP_YOFFSET;
    const rectWidth = main.width / main.zoom;
    const rectHeight = main.height / main.zoom;

    // Update the rectangle's position and size
    this.cameraRect.setPosition(rectX + mini.x, rectY + mini.y)
      .setSize(rectWidth, rectHeight);
  }
}