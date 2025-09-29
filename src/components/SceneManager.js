import { ROOM_SIZE, WELCOME_MESSAGE } from "../components/constants";
import SpeechBubble from "../components/SpeechBubble";

const DRAG_THRESHOLD = 4;

export default class SceneManager {
  constructor(scene) {
    this.scene = scene;
    this.objects = {};
    this.offsets = {};
    this.lastPointerDown = new Phaser.Math.Vector2();
  }

  hasDragged(pointer) {
    const distanceMoved = Phaser.Math.Distance.Between(
        this.lastPointerDown.x,
        this.lastPointerDown.y,
        pointer.x,
        pointer.y
    );

    return distanceMoved > DRAG_THRESHOLD;
  }

  createObjects() {
    const assets = this.scene.cache.json.get("assets");
    const xOffset = -ROOM_SIZE / 2;
    const yOffset = -ROOM_SIZE / 2;

    this.scene.input.on('pointerdown', (pointer) => {
      this.lastPointerDown.set(pointer.x, pointer.y);
    });

    assets.images.forEach((asset) => {
      this.offsets[asset.key] = { xBound: asset.boundingBox.x, yBound: asset.boundingBox.y };
      if (!asset.draw) return;

      const key = asset.key;
      if (asset.type === "sprite") {
        this.objects[key] = this.scene.physics.add.sprite(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key)
          .setOrigin(0)
          .setDepth(1)
          .setInteractive({ useHandCursor: true })
          .setName(key);

        this.objects[key].body.setAllowGravity(false);
        // this.setVertices(asset, key);
        this.scene.animationManager.addHoverEffect(key);
      } else if (asset.type === "env") {
        this.objects[key] = this.scene.physics.add.staticSprite(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key)
          .setOrigin(0)
          .setDepth(1)
          .setName(key);

        this.setVertices(asset, key);
      } else {
        this.objects[key] = this.scene.add.image(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key)
          .setOrigin(0)
          .setDepth(1)
          .setName(key);
      }
    });

    this.objects['floor_env'].setVisible(false);

    this.objects['piano_sprite'].on("pointerup", (pointer) => {
      if (this.hasDragged(pointer)) return;
      window.openYouTubePlaylist('PL5PnGHCu4otZLuNWBhpGLjbt8MBgeMZri', true);
    });
    this.objects['duo_sprite'].on("pointerup", (pointer) => {
      if (this.hasDragged(pointer)) return;
      window.openDuolingoProfile();
    });
    this.objects['laptop_sprite'].on("pointerup", (pointer) => {
      if (this.hasDragged(pointer)) return;
      window.openLeetCodeProfile();
    });
    this.objects['hockey_bag_sprite'].on("pointerup", (pointer) => {
      if (this.hasDragged(pointer)) return;
      window.openYouTubePlaylist('IA-fIDRE9Wg', false);
    });

    // Duo animations
    const duoTextures = [{ texture: 'duo_sprite', duration: 10000 }, { texture: 'duo_right', duration: 5000 }];
    this.scene.animationManager.addSprite(this.objects['duo_sprite'], duoTextures, true);

    // Create and display speech bubble with welcome message
    this.speechBubble = new SpeechBubble(this.scene, this.objects['npc_sprite']);
    this.speechBubble.addText(WELCOME_MESSAGE);
  }

  setVertices(asset, key) {
    if (asset.vertices && Object.keys(asset.vertices).length > 0) {
      // Convert the vertices object into an array
      const verticesArray = Object.values(asset.vertices);

      // Adjust vertices relative to the sprite's position
      this.objects[key].vertices = verticesArray.map((vertex) => ([
        vertex.x - asset.boundingBox.x,
        vertex.y - asset.boundingBox.y,
      ]));
    }
  }

  createClouds(amount) {
    for (let i = 0; i < amount; i++) {
      this.scene.cloudManager.spawnCloud();
    }
  }

  resizeScene() {
    this.scene.cameraControls.calcBounds();
    if (this.scene.minimap) this.scene.minimapManager.resize();
  }
}
