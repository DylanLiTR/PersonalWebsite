const baseUrl = import.meta.env.VITE_BASE_URL;

export default class AssetLoader {
  constructor(scene) {
    this.scene = scene;
  }

  loadAssets() {
    this.scene.load.json("assets", "/assets/sprites/sprites.json");

    this.scene.load.on("filecomplete-json-assets", () => {
      const assets = this.scene.cache.json.get("assets");
      assets.images.forEach((asset) => {
        this.scene.load.image(asset.key, asset.path);
      });

      // Load speech bubble
      this.scene.load.image("bubble", "/assets/sprites/speech_bubble/bubble.png");

      this.scene.load.start();
    });

    this.scene.load.on("progress", (progress) => {
      this.scene.game.events.emit("progress", progress);
    });

    this.scene.load.once("complete", () => {
      this.scene.game.events.emit("loadingComplete");
    });
  }
}
