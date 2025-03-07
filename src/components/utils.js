export function trimTo(str, char) {
  // Find the index of the last char
  const lastUnderscoreIndex = str.lastIndexOf(char);

  // If char is found, trim the string up to that index
  if (lastUnderscoreIndex !== -1) {
      return str.substring(0, lastUnderscoreIndex);
  }

  // If char is not found, return the original string
  return str;
}

export function isPointInPolygon(point, vertices) {
  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [x1, y1] = vertices[i];
    const [x2, y2] = vertices[j];

    // Check if point is within the y-bounds of the edge
    if ((y1 > py) !== (y2 > py)) {
      // Find the x-coordinate where the line segment crosses the horizontal ray
      const xIntersect = x1 + ((py - y1) * (x2 - x1)) / (y2 - y1);

      // Toggle "inside" status if point is to the left of the intersection
      if (px < xIntersect) {
        inside = !inside;
      }
    }
  }

  return inside;
}
