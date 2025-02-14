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
