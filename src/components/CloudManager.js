import { getRandomCloud } from "./utils";

export const FAR_CLOUD_SPEED = 0.05;
export const CLOSE_CLOUD_SPEED = 0.2;

const CLOUD_SPRITES = [
  { key: "big_cloud", weight: 0.5 },
  { key: "otter_cloud", weight: 0.09 },
  { key: "cinnamoroll_cloud", weight: 0.01 },
  { key: "small_cloud_1", weight: 0.2 },
  { key: "small_cloud_2", weight: 0.2 },
];

export default class CloudManager {
  constructor(scene) {
    this.scene = scene;
    this.clouds = [];
  }

  spawnCloud() {
    const cloudKey = getRandomCloud(CLOUD_SPRITES); // Randomly select a cloud sprite
    const cloud = this.scene.add.image(
      Phaser.Math.Between(-this.scene.scale.width, 0), // Start slightly off-screen
      Phaser.Math.Between(0, this.scene.scale.height), // Random Y position
      cloudKey
    );

    // Randomize size and speed
    const scale = Phaser.Math.FloatBetween(0.5, 1.5); // Random scale
    const speed = Phaser.Math.FloatBetween(FAR_CLOUD_SPEED, CLOSE_CLOUD_SPEED); // Random speed

    cloud.setScale(scale);
    cloud.speed = speed; // Attach speed to the cloud object

    this.clouds.push(cloud);
  }

  update() {
    // Move clouds and handle despawning
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const cloud = this.clouds[i];

      // Move the cloud
      cloud.x += cloud.speed;

      // Despawn if off-screen
      if (cloud.x > this.scene.scale.width + cloud.displayWidth / 2) {
        cloud.destroy(); // Remove the cloud from the scene
        this.clouds.splice(i, 1); // Remove the cloud from the array
        this.spawnCloud(); // Spawn a new cloud
      }
    }
  }
}
