import { ROOM_SIZE } from "../components/constants";
import { trimTo, isPointInPolygon } from "../components/utils";
import SpeechBubble from "../components/SpeechBubble";

export default class SceneManager {
  constructor(scene) {
    this.scene = scene;
    this.objects = {};
    this.offsets = {};
  }

  createObjects() {
    const assets = this.scene.cache.json.get("assets");
    const xOffset = -ROOM_SIZE / 2;
    const yOffset = -ROOM_SIZE / 2;

    assets.images.forEach((asset) => {
      if (!asset.draw) return;

      const key = asset.type === "sprite" || asset.type === "env" ? trimTo(asset.key, "_") : asset.key;
      if (asset.type === "sprite") {
        this.objects[key] = this.scene.physics.add.sprite(xOffset + asset.boundingBox.x, yOffset + asset.boundingBox.y, asset.key)
          .setOrigin(0)
          .setDepth(1)
          .setInteractive({ useHandCursor: true })
          .setName(key);

        this.objects[key].body.setAllowGravity(false);
        // this.setVertices(asset, key);
        this.addHoverEffect(key);
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
      this.offsets[key] = { xBound: asset.boundingBox.x, yBound: asset.boundingBox.y };
    });

    // this.enableHover();

    this.objects['floor'].setVisible(false);
    this.objects['piano'].on("pointerdown", () => {
      window.openYouTubePlaylist('PL5PnGHCu4otZLuNWBhpGLjbt8MBgeMZri');
    });
    this.objects['duo'].on("pointerdown", () => {
      window.openDuolingoProfile();
    });

    // Duo animations
    const duoTextures = [{ texture: 'duo_sprite', duration: 10000 }, { texture: 'duo_right', duration: 5000 }];
    this.scene.animationManager.addSprite(this.objects['duo'], duoTextures);

    // Create and display speech bubble
    this.speechBubble = new SpeechBubble(this.scene, this.objects['npc']);
    this.speechBubble.addText("Hi, my name is Dylan and welcome to my website! Feel free to look around and ask me any questions.");
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
    const xOffset = -ROOM_SIZE / 2;
    const yOffset = -ROOM_SIZE / 2;

    Object.entries(this.offsets).forEach(([key, obj]) => {
      this.objects[key].setPosition(xOffset + obj.xBound, yOffset + obj.yBound);
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
    });

    obj.on("pointerout", () => {
      obj.setTexture(prevTexture).setPosition(obj.x + 1, obj.y + 1);
      this.scene.animationManager.resumeSprite(obj);
    });
  }

  // enableHover() {
  //   this.scene.input.on("pointermove", (pointer) => {
  //     const pointerCoord = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

  //     // Query nearby objects using Phaser's built-in spatial lookup
  //     const nearbyObjects = this.scene.physics.overlapRect(pointerCoord.x, pointerCoord.y, 5, 5);

  //     for (let obj of nearbyObjects) {
  //       const sprite = obj.gameObject;
  //       const localPointer = [pointerCoord.x - sprite.x, pointerCoord.y - sprite.y];
  //       if (isPointInPolygon(localPointer, sprite.vertices)) {
  //         if (sprite.texture.key !== sprite.name + "_hover") {
  //           sprite.setTexture(sprite.name + "_hover").setPosition(sprite.x - 1, sprite.y - 1);
  //         }
  //         this.scene.input.setDefaultCursor("pointer");
  //       } else {
  //         if (sprite.texture.key === sprite.name + "_hover") {
  //           sprite.setTexture(sprite.name + "_sprite").setPosition(sprite.x + 1, sprite.y + 1);
  //           this.scene.input.setDefaultCursor("default");
  //         }
  //       }
  //     }
  //   });
  // }
}
