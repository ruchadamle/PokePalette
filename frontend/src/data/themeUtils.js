export function hexToRgba(hex, alpha) {
  const cleaned = hex.replace("#", "").trim();
  const full = cleaned.length === 3
    ? cleaned
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : cleaned;

  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function toSwatches(palette) {
  return [
    {
      role: "Background",
      value: palette.bg,
      chipStyle: { background: palette.bg },
    },
    {
      role: "Primary",
      value: palette.primary,
      chipStyle: { background: palette.primary },
    },
    {
      role: "Accent",
      value: palette.accent,
      chipStyle: { background: palette.accent },
    },
    {
      role: "Text",
      value: palette.text,
      chipStyle: { background: palette.text },
    },
  ];
}
