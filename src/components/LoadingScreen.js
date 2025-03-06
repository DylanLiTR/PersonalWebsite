import { DEFAULT_ZOOM } from "../components/constants";

export default class LoadingScreen {
  static fadeOut(scene, onComplete) {
    // Add a white screen covering the entire scene
    const loadingScreen = scene.add
      .rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height, 0xffffff)
      .setDepth(100);

    // Fade out the white screen
    scene.tweens.add({
      targets: loadingScreen,
      alpha: 0, // Fade to transparent
      duration: 2000,
      ease: "Linear",
    });

    scene.cameras.main.zoomTo(DEFAULT_ZOOM, 3000, "Power2", true, (camera, progress) => {
      if (progress === 1) {
        loadingScreen.destroy();

        scene.cameraControls.zoom = DEFAULT_ZOOM;
        let cam = scene.cameras.main;
        cam.setScroll(-cam.width / 2, -cam.height / 2);
        cam.setZoom(scene.cameraControls.zoom);
        scene.cameraControls.calcBounds();

        // Enable camera controls
        scene.cameraControls.enablePanning();
        scene.cameraControls.enableZooming();
        scene.isLoading = false;
      }
    });
  }
}
