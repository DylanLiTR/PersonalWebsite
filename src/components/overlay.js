export const startDragging = (clientX, clientY, overlay, setPosition) => {
  const offsetX = clientX - overlay.getBoundingClientRect().left;
  const offsetY = clientY - overlay.getBoundingClientRect().top;

  const moveOverlay = (clientX, clientY) => {
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, clientX - offsetX)),
      y: Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, clientY - offsetY)),
    });
  };

  const handleMouseMove = (e) => moveOverlay(e.clientX, e.clientY);
  const handleTouchMove = (e) => moveOverlay(e.touches[0].clientX, e.touches[0].clientY);

  const stopDragging = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', stopDragging);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', stopDragging);
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchmove', handleTouchMove);
  window.addEventListener('touchend', stopDragging);
};