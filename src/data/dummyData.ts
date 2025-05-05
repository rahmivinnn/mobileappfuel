
// Generate 100 random stations around Bandung, Indonesia

// Helper function to generate random coordinates around Bandung
function generateRandomCoordinates(baseLat: number, baseLng: number, radiusInKm: number) {
  const earthRadius = 6371; // Earth radius in kilometers
  const degreesToRadians = Math.PI / 180;
  const radiansToDegreesLat = 180 / Math.PI;
  const radiansToDegreesLng = 180 / Math.PI / Math.cos(baseLat * degreesToRadians);
  
  const randomDistance = Math.random() * radiusInKm;
  const randomAngle = Math.random() * 2 * Math.PI;
  
  const latOffset = randomDistance / earthRadius * radiansToDegreesLat;
  const lngOffset = randomDistance / earthRadius * radiansToDegreesLng;
  
  const lat = baseLat + latOffset * Math.sin(randomAngle);
  const lng = baseLng + lngOffset * Math.cos(randomAngle);
  
  return { lat, lng };
}

// Bandung coordinates
const bandungLat = -6.9175;
const bandungLng = 107.6191;

// Gas station brand names in Indonesia
const stationBrands = [
  'Pertamina', 
  'Shell', 
  'BP', 
  'Total', 
  'Vivo', 
  'Petronas',
  'SPBU',
  'MyPertamina',
  'Bright',
  'Exxon Mobil'
];

// Bandung area neighborhoods and areas
const bandungAreas = [
  'Dago',
  'Setiabudi',
  'Lembang',
  'Pasteur',
  'Cipaganti',
  'Antapani',
  'Cibiru',
  'Buahbatu',
  'Kebon Kawung',
  'Pasir Koja',
  'Cicendo',
  'Ujung Berung',
  'Batununggal',
  'Cimahi',
  'Cibaduyut',
  'Ciumbuleuit',
  'Sukajadi',
  'Cibeunying',
  'Arcamanik',
  'Margacinta'
];

// Bandung streets
const bandungStreets = [
  'Jl. Asia Afrika',
  'Jl. Braga',
  'Jl. Dago',
  'Jl. Ir. H. Juanda',
  'Jl. Merdeka',
  'Jl. Pasirkaliki',
  'Jl. Gatot Subroto',
  'Jl. Pasteur',
  'Jl. Soekarno-Hatta',
  'Jl. Dipatiukur',
  'Jl. Cihampelas',
  'Jl. Riau',
  'Jl. Buah Batu',
  'Jl. Ahmad Yani',
  'Jl. Supratman',
  'Jl. Laswi',
  'Jl. Pajajaran',
  'Jl. Setiabudi',
  'Jl. Terusan Jakarta',
  'Jl. Sudirman'
];

// Fuel types available in Indonesia
export const fuelTypes = [
  { id: 'pertalite', name: 'Pertalite', price: 10000 },
  { id: 'pertamax', name: 'Pertamax', price: 13500 },
  { id: 'pertamaxturbo', name: 'Pertamax Turbo', price: 15000 },
  { id: 'solar', name: 'Solar', price: 6800 },
  { id: 'dexlite', name: 'Dexlite', price: 13150 }
];

// Generate station images
const stationImages = [
  '/lovable-uploads/00333baa-ca73-4e51-8f20-49acab199b5b.png',
  '/lovable-uploads/049ef9d2-46de-4e78-bee2-10fa706d9425.png',
  '/lovable-uploads/8c6a633e-ae68-4424-b2b3-4458a96b7d3b.png',
  '/lovable-uploads/aafa9060-dd0c-4f89-9725-afe221ab74ba.png',
  '/lovable-uploads/ba008608-8960-40b9-8a96-e5b173a48e08.png',
  '/lovable-uploads/c123a960-63f7-48ab-b0a0-6f29584106f7.png'
];

// Generate 100 random gas stations
export const allStations = Array.from({ length: 100 }, (_, i) => {
  const coords = generateRandomCoordinates(bandungLat, bandungLng, 10);
  const brandName = stationBrands[Math.floor(Math.random() * stationBrands.length)];
  const area = bandungAreas[Math.floor(Math.random() * bandungAreas.length)];
  const street = bandungStreets[Math.floor(Math.random() * bandungStreets.length)];
  const distance = (Math.random() * 15).toFixed(1);
  const rating = (3 + Math.random() * 2).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 100) + 5;
  const isOpen = Math.random() > 0.2; // 80% chance of being open
  const imageUrl = stationImages[Math.floor(Math.random() * stationImages.length)];
  
  // Generate random available fuel types and prices
  const availableFuels = fuelTypes.filter(() => Math.random() > 0.3).map(fuel => ({
    ...fuel,
    price: (fuel.price + (Math.random() * 500 - 250)).toFixed(0) // Add random price variation in Indonesian Rupiah
  }));
  
  return {
    id: (i + 1).toString(),
    name: `${brandName} ${area}`,
    address: `${street}, ${area}, Bandung`,
    distance,
    rating: parseFloat(rating),
    reviewCount,
    isOpen,
    imageUrl,
    position: coords,
    fuels: availableFuels,
    amenities: {
      hasConvenienceStore: Math.random() > 0.3,
      hasCarWash: Math.random() > 0.7,
      hasRestrooms: Math.random() > 0.2,
      hasATM: Math.random() > 0.5,
      hasFoodService: Math.random() > 0.6
    }
  };
});

// Generate 100 random order history items
const orderStatuses = ['selesai', 'dalam pengiriman', 'diproses', 'dibatalkan'];

export const orderHistory = Array.from({ length: 100 }, (_, i) => {
  const station = allStations[Math.floor(Math.random() * allStations.length)];
  const fuel = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
  const quantity = Math.floor(Math.random() * 10) + 1;
  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days
  const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
  
  return {
    id: `ORD-${100000 + i}`,
    stationId: station.id,
    stationName: station.name,
    fuelType: fuel.name,
    quantity,
    totalPrice: (fuel.price * quantity).toFixed(0),
    orderDate: orderDate.toISOString(),
    status,
    items: [
      { name: `${quantity} Liter ${fuel.name}`, quantity: '1x', price: parseFloat((fuel.price * quantity).toFixed(0)) },
      ...(Math.random() > 0.7 ? [{ name: 'Cemilan', quantity: '2x', price: 25000 }] : [])
    ],
    driver: Math.random() > 0.5 ? {
      name: 'Budi Santoso',
      location: 'Bandung, Jawa Barat',
      image: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png',
      rating: 4.8,
      phone: '+62 812-3456-7890'
    } : {
      name: 'Dewi Pratiwi',
      location: 'Bandung, Jawa Barat',
      image: '/lovable-uploads/c3b29f6b-a689-4ac3-a338-4194cbee5e0c.png',
      rating: 4.9,
      phone: '+62 857-1234-5678'
    }
  };
});
