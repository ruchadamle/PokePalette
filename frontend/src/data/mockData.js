export const POKEMON = [
  {
    key: "pikachu",
    name: "Pikachu",
    types: ["Electric"],
    dex: 25,
    imageSrc: "/fatpikachu.jpg",
    palette: {
      bg: "#FFF9DC",
      primary: "#F2C94C",
      accent: "#6B4E16",
      text: "#2F2412",
    },
  },
  {
    key: "charmander",
    name: "Charmander",
    types: ["Fire"],
    dex: 4,
    imageSrc: "/charmander.jpg",
    palette: {
      bg: "#FFE3D6",
      primary: "#FF6A2A",
      accent: "#2E1B14",
      text: "#1A1A1A",
    },
  },
  {
    key: "bulbasaur",
    name: "Bulbasaur",
    types: ["Grass", "Poison"],
    dex: 1,
    imageSrc: "/bulbasaur.jpg",
    palette: {
      bg: "#DFF7E6",
      primary: "#2FAF64",
      accent: "#163022",
      text: "#1A1A1A",
    },
  },
  {
    key: "squirtle",
    name: "Squirtle",
    types: ["Water"],
    dex: 7,
    imageSrc: "/squirtle.jpg",
    palette: {
      bg: "#E3F2FF",
      primary: "#2D9CDB",
      accent: "#14324A",
      text: "#0F1A24",
    },
  },
  {
    key: "joltik",
    name: "Joltik",
    types: ["Bug", "Electric"],
    dex: 595,
    imageSrc: "/joltik.png",
    palette: {
      bg: "#FFF9DC",
      primary: "#F2C94C",
      accent: "#3B2A10",
      text: "#20180C",
    },
  },
];

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

export const INITIAL_THEMES = [
  {
    id: "t1",
    pokemonKey: "squirtle",
    pokemonName: "Squirtle",
    types: ["Water"],
    dex: 7,
    imageSrc: "/squirtle.jpg",
    isFavorite: true,
    palette: POKEMON.find((p) => p.key === "squirtle").palette,
  },
  {
    id: "t2",
    pokemonKey: "joltik",
    pokemonName: "Joltik",
    types: ["Bug", "Electric"],
    dex: 595,
    imageSrc: "/joltik.png",
    isFavorite: true,
    palette: POKEMON.find((p) => p.key === "joltik").palette,
  },
];
