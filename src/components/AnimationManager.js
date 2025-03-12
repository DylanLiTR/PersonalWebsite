import { trimTo, isPointInPolygon } from "../components/utils";

export default class AnimationManager {
  constructor(scene) {
      this.scene = scene; // Phaser scene
      this.sprites = []; // Array to store sprites and their animation data
      this.timer = null; // Timer for the animation loop
  }

  // Add a sprite to the animation manager with texture-duration pairs
  addSprite(sprite, textureDurations, canOverride = false) {
      this.sprites.push({
          sprite: sprite,
          textureDurations: textureDurations, // Array of { texture, duration }
          currentIndex: 0,
          elapsedTime: 0, // Track elapsed time for the current texture
          paused: false, // Track whether the sprite's animation is paused
          canOverride: canOverride
      });

      // Start the animation loop if it's not already running
      if (!this.timer) {
          this.startAnimation();
      }
  }

  // Remove a sprite from the animation manager
  removeSprite(sprite) {
      this.sprites = this.sprites.filter(entry => entry.sprite !== sprite);

      // Stop the animation loop if no sprites are left
      if (this.sprites.length === 0) {
          this.stopAnimation();
      }
  }

  // Start the animation loop
  startAnimation() {
      this.timer = this.scene.time.addEvent({
          delay: 16, // Update every frame (~60 FPS)
          callback: this.updateAnimations,
          callbackScope: this,
          loop: true
      });
  }

  // Stop the animation loop
  stopAnimation() {
      if (this.timer) {
          this.timer.destroy();
          this.timer = null;
      }
  }

  // Update animations for all sprites
  updateAnimations() {
      const now = this.scene.time.now; // Current time in milliseconds

      for (const entry of this.sprites) {
          const { sprite, textureDurations, currentIndex, elapsedTime, paused } = entry;

          // Skip if the sprite's animation is paused
          if (paused) continue;

          // Calculate the time since the last update
          const deltaTime = now - elapsedTime;

          // Get the current texture and duration
          const { texture, duration } = textureDurations[currentIndex];

          // Check if enough time has passed for the current texture
          if (deltaTime >= duration) {
              // Move to the next texture in the array
              entry.currentIndex = (currentIndex + 1) % textureDurations.length;

              // Update the sprite's texture
              this.setTexture(sprite, textureDurations[entry.currentIndex].texture);

              // Reset the elapsed time for the new texture
              entry.elapsedTime = now;
          }
      }
  }

  // Pause animation for a specific sprite
  pauseSprite(sprite) {
      const entry = this.sprites.find(entry => entry.sprite === sprite);
      if (entry) {
          entry.paused = true;
      }
  }

  // Resume animation for a specific sprite
  resumeSprite(sprite) {
      const entry = this.sprites.find(entry => entry.sprite === sprite);
      if (entry) {
          entry.paused = false;
      }
  }
  
  setTexture(sprite, texture) {
    const sceneManager = this.scene.sceneManager;
    const xOffset = sceneManager.offsets[texture].xBound - sceneManager.offsets[sprite.texture.key].xBound;
    const yOffset = sceneManager.offsets[texture].yBound - sceneManager.offsets[sprite.texture.key].yBound;

    sprite.setPosition(sprite.x + xOffset, sprite.y + yOffset);
    sprite.setTexture(texture);
    return sprite;
  }

  addHoverEffect(spriteName) {
    const obj = this.scene.sceneManager.objects[spriteName];
    const trimmedSpriteName = trimTo(spriteName, "_");
    let prevTexture = spriteName;

    obj.on("pointerover", () => {
      if (obj.texture.key === trimmedSpriteName + "_sprite" || this.sprites.find(entry => entry.sprite === obj)?.canOverride) {
        prevTexture = obj.texture.key;
        this.pauseSprite(obj);
        this.setTexture(obj, trimmedSpriteName + "_hover");
      }
    });

    obj.on("pointerout", () => {
      if (obj.texture.key === trimmedSpriteName + "_hover") {
        this.setTexture(obj, prevTexture);
        this.resumeSprite(obj);
      }
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
