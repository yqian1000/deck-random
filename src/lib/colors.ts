const SECTOR_COLORS = [
  '#c45c4a',
  '#d4873c',
  '#d4b13c',
  '#7aab4a',
  '#3e9e7a',
  '#3a8f9e',
  '#3d6fc4',
  '#5b5ec9',
  '#8a4fc4',
  '#c44f8a',
  '#c44f5c',
  '#8a6b4a',
  '#4a8a6b',
  '#4a6b8a',
  '#6b4a8a',
  '#a85a3c',
  '#5aa85a',
  '#3c7aa8',
  '#a83c7a',
  '#7a5aa8',
  '#b8943c',
  '#3cb89a',
  '#c46b3c',
  '#5c6bc4',
]

export function colorAt(index: number): string {
  return SECTOR_COLORS[index % SECTOR_COLORS.length]
}
