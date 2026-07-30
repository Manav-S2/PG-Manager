// Curated Unsplash images are used as development/demo photography. Keep image
// selection in data so production property media can replace this list without UI changes.
const UNSPLASH_BASE = 'https://images.unsplash.com/';
const imageUrl = (id: string) => `${UNSPLASH_BASE}${id}?auto=format&fit=crop&w=1400&q=85`;

export const PROPERTY_IMAGES = [
  imageUrl('photo-1522708323590-d24dbb6b0267'),
  imageUrl('photo-1505693416388-ac5ce068fe85'),
  imageUrl('photo-1616486338812-3dadae4b4ace'),
  imageUrl('photo-1600210492486-724fe5c67fb0'),
  imageUrl('photo-1600607687920-4e2a09cf159d'),
  imageUrl('photo-1600585154340-be6161a56a0c'),
  imageUrl('photo-1615874694520-474822394e73'),
  imageUrl('photo-1618221195710-dd6b41faaea6'),
  imageUrl('photo-1600047509807-ba8f99d2cdde'),
  imageUrl('photo-1617104678098-de229db51175'),
  imageUrl('photo-1600566753086-00f18fb6b3ea'),
  imageUrl('photo-1554995207-c18c203602cb'),
  imageUrl('photo-1560185007-cde436f6a4d0'),
  imageUrl('photo-1536376072261-38c75010e6c9'),
];

export const getPropertyImage = (title: string) => {
  const index = Array.from(title).reduce((total, character) => total + character.charCodeAt(0), 0) % PROPERTY_IMAGES.length;
  return PROPERTY_IMAGES[index];
};
