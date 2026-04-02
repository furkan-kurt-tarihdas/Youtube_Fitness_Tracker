export const THEME_COLORS = [
  { hex: '#D8B4E2', label: 'Mor' },
  { hex: '#FDEFB2', label: 'Sarı' },
  { hex: '#B5E4CA', label: 'Yeşil' },
  { hex: '#F9C4C4', label: 'Pembe' },
  { hex: '#B4D4E7', label: 'Mavi' },
];

export const PASTEL_COLORS = THEME_COLORS.map(c => c.hex);

export const getRandomPastelColor = () => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};
