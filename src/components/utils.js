export function getRandomCloud(cloudSprites) {
  const totalWeight = cloudSprites.reduce((sum, cloud) => sum + cloud.weight, 0);
  let random = Math.random() * totalWeight;

  for (const cloud of cloudSprites) {
    if (random < cloud.weight) {
      return cloud.key;
    }
    random -= cloud.weight;
  }

  return cloudSprites[0].key;
}
