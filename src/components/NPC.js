import { isPointInPolygon } from "../components/utils";

export default class NPC {
  constructor(scene) {
    this.scene = scene;
    this.sceneManager = this.scene.sceneManager;

    // Create NPC as a physics sprite
    this.sprite = this.sceneManager.objects['npc_sprite'];
    this.shadow = this.sceneManager.objects['npc_shadow'];
    this.floor = this.sceneManager.objects['floor_env'];
    this.scene.physics.world.enable(this.sprite);
    this.sprite.body.setCollideWorldBounds(false);

    this.scene.input.setDraggable(this.sprite);

    // Add drag events
    this.sprite.on("dragstart", () => {
      this.isDragging = true;
      this.sprite.body.setAllowGravity(false);
      this.sprite.body.setVelocity(0); // Stop existing motion

      this.oldxBound = this.sceneManager.offsets[this.sprite.texture.key].xBound;
      this.oldyBound = this.sceneManager.offsets[this.sprite.texture.key].yBound;

      const npcTextures = [{ texture: 'npc_hands_down', duration: 300 }, { texture: 'npc_hands_up', duration: 300 }];
      this.scene.animationManager.addSprite(this.sprite, npcTextures);
      if (this.onGround) this.scene.animationManager.pauseSprite(this.sprite);
    });
    
    this.sprite.on("drag", (pointer, dragX, dragY) => {
      const xOffset = this.sceneManager.offsets[this.sprite.texture.key].xBound - this.oldxBound;
      const yOffset = this.sceneManager.offsets[this.sprite.texture.key].yBound - this.oldyBound;

      this.sprite.setPosition(dragX + xOffset, dragY + yOffset); // Move NPC with the pointer
      this.sprite.body.setVelocity(0); // Prevent unwanted motion

      if (this.onGround) this.scene.animationManager.pauseSprite(this.sprite);
      else this.scene.animationManager.resumeSprite(this.sprite);
    });
    
    this.sprite.on("dragend", () => {
      this.isDragging = false;
      this.sprite.body.setAllowGravity(true);

      this.scene.animationManager.removeSprite(this.sprite);
      if (!this.onGround) this.scene.animationManager.setTexture(this.sprite, "npc_hands_up");
    });
  }

  update() {
    const spriteBottomCenterX = this.sprite.x + this.sprite.width / 2;
    const spriteBottomCenterY = this.sprite.y + this.sprite.height;

    this.onGround = (this.onGround && !this.isDragging) || isPointInPolygon([spriteBottomCenterX - this.floor.x, spriteBottomCenterY - this.floor.y], this.floor.vertices);

    if (this.onGround) {
      this.shadow.setVisible(true);

      this.sprite.body.setAllowGravity(false);
      this.sprite.setVelocityY(0);
      if (!this.prevOnGround) this.scene.animationManager.setTexture(this.sprite, "npc_sprite");
    } else {
      this.shadow.setVisible(false);

      if (!this.isDragging) this.sprite.body.setAllowGravity(true);
    }

    // If NPC falls below the scene, teleport to the top center
    if (this.sprite.y > this.scene.scale.height / 2) {
      this.sprite.setPosition(-this.sprite.width / 2, -this.scene.scale.height / 2);
      this.sprite.setVelocity(0); // Reset velocity
    }

    const xOffset = this.sceneManager.offsets["npc_shadow"].xBound - this.sceneManager.offsets["npc_sprite"].xBound + (this.sprite.texture.key.includes("hover") ? 1 : 0);
    const yOffset = this.sceneManager.offsets["npc_shadow"].yBound - this.sceneManager.offsets["npc_sprite"].yBound + (this.sprite.texture.key.includes("hover") ? 1 : 0);

    this.sceneManager.objects["npc_shadow"].x = this.sceneManager.objects["npc_sprite"].x + xOffset;
    this.sceneManager.objects["npc_shadow"].y = this.sceneManager.objects["npc_sprite"].y + yOffset;

    this.prevOnGround = this.onGround;
  }
}
