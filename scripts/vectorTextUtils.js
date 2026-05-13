export const EMPTY_VECTOR_TEXT = "0, 0, 0";

export function parseNumberList(value) {
  const numbers = value
    .split(",")
    .map((item) => Number(item.trim()));

  return numbers.length === 3 && numbers.every(Number.isFinite) ? numbers : null;
}

export function vectorToNumberArray(vector) {
  if (!vector) return null;

  return [vector.x, vector.y, vector.z]
    .map((value) => Number(Number(value).toFixed(2)));
}

export function vectorToText(vector, { fixed = false } = {}) {
  const values = vectorToNumberArray(vector);
  if (!values) return EMPTY_VECTOR_TEXT;

  return values
    .map((value) => fixed ? Number(value).toFixed(2) : value)
    .join(", ");
}

export function numberListToText(position) {
  return position ? position.join(", ") : EMPTY_VECTOR_TEXT;
}
