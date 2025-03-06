import { MINIMAP_XOFFSET, MINIMAP_YOFFSET, MIN_ZOOM } from "../components/constants";

export default class MinimapManager {
  constructor(scene) {
    this.scene = scene;
    this.createMinimap();
  }

  createMinimap() {
    const scale = 8;
    const zoom = MIN_ZOOM / 16;

    this.scene.minimap = this.scene.cameras
      .add(
        MINIMAP_XOFFSET,
        MINIMAP_YOFFSET,
        this.scene.cameras.main.width / scale,
        this.scene.cameras.main.height / scale
      )
      .setZoom(zoom)
      .setName("mini");

    this.scene.minimap.setBackgroundColor(0x76BDDA);
    this.scene.minimap.scrollX = -this.scene.minimap.width / 2;
    this.scene.minimap.scrollY = -this.scene.minimap.height / 2;

    // Create the camera rectangle overlay
    this.scene.cameraRect = this.scene.add
      .rectangle(0, 0, 0, 0, 0xffffff, 0.5)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);

    this.scene.cameras.main.ignore(this.scene.cameraRect);
  }

  updateMinimap() {
    const main = this.scene.cameras.main;
    const mini = this.scene.minimap;

    // Calculate the position and size of the rectangle
    const rectX = main.scrollX + main.width / 2 + mini.width / 2 - MINIMAP_XOFFSET;
    const rectY = main.scrollY + main.height / 2 + mini.height / 2 - MINIMAP_YOFFSET;
    const rectWidth = main.width / main.zoom;
    const rectHeight = main.height / main.zoom;

    // Update the rectangle's position and size
    this.scene.cameraRect.setPosition(rectX + mini.x, rectY + mini.y).setSize(rectWidth, rectHeight);
  }
}
