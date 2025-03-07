import { MIN_ZOOM, MAX_ZOOM } from "../components/constants";

export default class CameraControls {
  constructor(scene) {
    this.scene = scene;
    this.cam = this.scene.cameras.main;
    this.zoom = 1;
    this.isPanning = false;
    this.dragStartWorld = new Phaser.Math.Vector2(); // World coordinate at drag start
    this.dragVelocity = new Phaser.Math.Vector2();
    this.inertiaDecay = 0.9;

    this.calcBounds();
  }

  enableZooming() {
    this.scene.input.on("wheel", (pointer, dx, dy) => {
      if (dy > 0) this.changeZoom(0.9); // Zoom out
      if (dy < 0) this.changeZoom(1.1); // Zoom in
    });
  }

  enablePanning() {
    // Enable panning using pointer events
    this.scene.input.on("pointerdown", (pointer) => {
      const pointerCoord = this.cam.getWorldPoint(pointer.x, pointer.y);
      const npcHover = this.scene.sceneManager.objects["npc"].getBounds().contains(pointerCoord.x, pointerCoord.y);
      
      if (!npcHover) {
        this.isPanning = true;

        // Store the world coordinate under the pointer at drag start
        this.dragStartWorld = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

        // Reset velocity
        this.dragVelocity.set(0, 0);
      }
    });

    this.scene.input.on("pointermove", (pointer) => {
      if (this.isPanning && pointer.isDown) {
        const camera = this.cam;

        // Get the current world coordinate under the pointer
        const currentWorld = camera.getWorldPoint(pointer.x, pointer.y);

        // Calculate the delta in world coordinates
        const deltaX = currentWorld.x - this.dragStartWorld.x;
        const deltaY = currentWorld.y - this.dragStartWorld.y;

        // Update camera scroll to keep the pointer over the same world coordinate
        camera.scrollX -= deltaX;
        camera.scrollY -= deltaY;

        // Update velocity for inertia
        this.dragVelocity.set(deltaX, deltaY);
      }
    });

    this.scene.input.on("pointerup", () => {
      this.isPanning = false;
    });
  }

  applyInertia() {
    // Apply inertia if not dragging
    if (!this.isPanning && this.dragVelocity.length() > 0) {
      const camera = this.scene.cameras.main;

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

  changeZoom(factor) {
    this.zoom *= factor;
    this.zoom = Phaser.Math.Clamp(this.zoom, MIN_ZOOM, MAX_ZOOM);
    this.scene.cameras.main.setZoom(this.zoom);
    this.calcBounds();
  }

  calcBounds() {
    const scaledWidth = this.scene.cameras.main.width / this.zoom;
    const scaledHeight = this.scene.cameras.main.height / this.zoom;
    this.scene.cameras.main.setBounds(-scaledWidth, -scaledHeight, scaledWidth * 2, scaledHeight * 2);
  }
}