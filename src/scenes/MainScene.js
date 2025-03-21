import Phaser from "phaser";

import CloudManager from "../components/CloudManager";
import AnimationManager from "../components/AnimationManager";

import AssetLoader from "../components/AssetLoader";
import SceneManager from "../components/SceneManager";
import CameraControls from "../components/CameraControls";
import MinimapManager from "../components/MinimapManager";
import LoadingScreen from "../components/LoadingScreen";
import NPC from "../components/NPC";
import { ROOM_SIZE } from "../components/constants";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    this.assetLoader = new AssetLoader(this);
    this.assetLoader.loadAssets();
  }

  create() {
    this.isLoading = true;
    let cam = this.cameras.main;
    cam.setBackgroundColor("#87CEEB"); // sky color
    cam.setScroll(-cam.width / 2, -cam.height / 2);

    // Initialize managers
    this.cloudManager = new CloudManager(this);
    this.sceneManager = new SceneManager(this);
    this.cameraControls = new CameraControls(this);
    this.minimapManager = new MinimapManager(this);
    this.animationManager = new AnimationManager(this);

    this.cameraControls.calcBounds();
    if (cam.width >= cam.height) this.minimapManager.createMinimap();
    this.sceneManager.createObjects();
    this.sceneManager.createClouds(25);

    this.npc = new NPC(this);

    // Handle scene resizing
    this.scale.on("resize", () => this.sceneManager.resizeScene());

    // Show loading screen
    setTimeout(() => {
      LoadingScreen.fadeOut(this);
    }, 1000);
  }

  update() {
    this.cloudManager.update();
    this.minimapManager.updateMinimap();
    this.cameraControls.applyInertia();
    this.animationManager.updateAnimations();
    this.npc.update();
    if (this.npc.sprite.body.speed > 0 || this.npc.isDragging) {
      this.sceneManager.speechBubble.update();
    }
  }
}
