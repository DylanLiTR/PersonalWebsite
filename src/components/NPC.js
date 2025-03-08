import { isPointInPolygon } from "../components/utils";

export default class NPC {
  constructor(scene) {
    this.scene = scene;
    this.sceneManager = this.scene.sceneManager;

    // Create NPC as a physics sprite
    this.sprite = this.sceneManager.objects['npc'];
    this.shadow = this.sceneManager.objects['npc_shadow'];
    this.floor = this.sceneManager.objects['floor'];
    this.scene.physics.world.enable(this.sprite);
    this.sprite.body.setCollideWorldBounds(false);

    this.scene.input.setDraggable(this.sprite);

    // Add drag events
    this.sprite.on("dragstart", () => {
      this.isDragging = true;
      this.sprite.body.setAllowGravity(false);
      this.sprite.body.setVelocity(0); // Stop existing motion
    });
    
    this.sprite.on("drag", (pointer, dragX, dragY) => {
      this.sprite.setPosition(dragX, dragY); // Move NPC with the pointer
      this.sprite.body.setVelocity(0); // Prevent unwanted motion
    });
    
    this.sprite.on("dragend", () => {
      this.isDragging = false;
      this.sprite.body.setAllowGravity(true);
    });
  }

  update() {
    const spriteBottomCenterX = this.sprite.x + this.sprite.width / 2;
    const spriteBottomCenterY = this.sprite.y + this.sprite.height;

    this.onGround = isPointInPolygon([spriteBottomCenterX - this.floor.x, spriteBottomCenterY - this.floor.y], this.floor.vertices);

    if (this.onGround) {
      this.shadow.setVisible(true);

      this.sprite.body.setAllowGravity(false);
      this.sprite.setVelocityY(0);
    } else {
      this.shadow.setVisible(false);

      if (!this.isDragging) this.sprite.body.setAllowGravity(true);
    }

    // If NPC falls below the scene, teleport to the top center
    if (this.sprite.y > this.scene.scale.height / 2) {
      this.sprite.setPosition(-this.sprite.width / 2, -this.scene.scale.height / 2);
      this.sprite.setVelocity(0); // Reset velocity
    }

    const xOffset = this.sceneManager.offsets["npc_shadow"].xBound - this.sceneManager.offsets["npc"].xBound + (this.sprite.texture.key.includes("hover") ? 1 : 0);
    const yOffset = this.sceneManager.offsets["npc_shadow"].yBound - this.sceneManager.offsets["npc"].yBound + (this.sprite.texture.key.includes("hover") ? 1 : 0);

    this.sceneManager.objects["npc_shadow"].x = this.sceneManager.objects["npc"].x + xOffset;
    this.sceneManager.objects["npc_shadow"].y = this.sceneManager.objects["npc"].y + yOffset;
  }
}
