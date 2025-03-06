import { ROOM_SIZE } from "../components/constants";
import { trimTo } from "../components/utils";
import SpeechBubble from "../components/SpeechBubble";

export default class SceneManager {
  constructor(scene) {
    this.scene = scene;
    this.objects = {};
    this.offsets = [];
  }

  createObjects() {
    const assets = this.scene.cache.json.get("assets");
    const xOffset = -ROOM_SIZE / 2;
    const yOffset = -ROOM_SIZE / 2;

    assets.images.forEach((asset) => {
      if (!asset.draw) return;

      const key = asset.type === "sprite" ? trimTo(asset.key, "_") : asset.key;
      const obj = asset.type === "sprite"
        ? this.scene.add.sprite(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key)
          .setOrigin(0)
          .setDepth(1)
          .setInteractive()
        : this.scene.add.image(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key)
          .setOrigin(0)
          .setDepth(1);

      this.objects[key] = obj;
      this.offsets.push({ key, xBound: asset.boundingBox.x, yBound: asset.boundingBox.y });

      if (asset.type === "sprite") {
        this.addHoverEffect(key);
      }
    });

    // Create and display speech bubble
    this.speechBubble = new SpeechBubble(this.scene, this.objects['npc'].x, this.objects['npc'].y - 10);
    this.speechBubble.addText("Hi, my name is Dylan and welcome to my website! Feel free to look around and ask me any questions.");
  }

  createClouds(amount) {
    for (let i = 0; i < amount; i++) {
      this.scene.cloudManager.spawnCloud();
    }
  }

  resizeScene() {
    const xOffset = -ROOM_SIZE / 2;
    const yOffset = -ROOM_SIZE / 2;

    this.offsets.forEach((obj) => {
      this.objects[obj.key].setPosition(xOffset + obj.xBound, yOffset + obj.yBound);
    });
    this.scene.cameraControls.calcBounds();
  }

  addHoverEffect(spriteName) {
    const obj = this.objects[spriteName];
    let prevTexture = spriteName + "_sprite";

    obj.on("pointerover", () => {
      prevTexture = obj.texture.key;
      this.scene.animationManager.pauseSprite(obj);
      obj.setTexture(spriteName + "_hover").setPosition(obj.x - 1, obj.y - 1);
      this.scene.input.setDefaultCursor("pointer");
    });

    obj.on("pointerout", () => {
      obj.setTexture(prevTexture).setPosition(obj.x + 1, obj.y + 1);
      this.scene.input.setDefaultCursor("default");
      this.scene.animationManager.resumeSprite(obj);
    });
  }
}
