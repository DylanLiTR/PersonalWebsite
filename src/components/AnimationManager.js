export default class AnimationManager {
  constructor(scene) {
      this.scene = scene; // Phaser scene
      this.sprites = []; // Array to store sprites and their animation data
      this.timer = null; // Timer for the animation loop
  }

  // Add a sprite to the animation manager with texture-duration pairs
  addSprite(sprite, textureDurations) {
      this.sprites.push({
          sprite: sprite,
          textureDurations: textureDurations, // Array of { texture, duration }
          currentIndex: 0,
          elapsedTime: 0, // Track elapsed time for the current texture
          paused: false // Track whether the sprite's animation is paused
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
              sprite.setTexture(textureDurations[entry.currentIndex].texture);

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
}
