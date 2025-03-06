import { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM } from "../components/constants";

export default class CameraControls {
  constructor(scene) {
    this.scene = scene;
    this.zoom = 1;
    this.isDragging = false;
    this.dragStart = new Phaser.Math.Vector2();
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
    this.scene.input.on("pointerdown", (pointer) => {
      this.isDragging = true;
      this.dragStart.set(pointer.x, pointer.y);
      this.dragVelocity.set(0, 0);
    });

    this.scene.input.on("pointerup", () => {
      this.isDragging = false;
    });

    this.scene.input.on("pointermove", (pointer) => {
      if (this.isDragging && pointer.isDown) {
        const camera = this.scene.cameras.main;
        const dragDelta = new Phaser.Math.Vector2(
          Phaser.Math.RoundTo((pointer.x - this.dragStart.x) / this.zoom, 0),
          Phaser.Math.RoundTo((pointer.y - this.dragStart.y) / this.zoom, 0)
        );

        camera.scrollX -= dragDelta.x;
        camera.scrollY -= dragDelta.y;

        this.dragVelocity.set(dragDelta.x, dragDelta.y);
        this.dragStart.set(pointer.x, pointer.y);
      }
    });
  }

  applyInertia() {
    // Apply inertia if not dragging
    if (!this.isDragging && this.dragVelocity.length() > 0) {
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
