
// Generate 100 random stations around Los Angeles, United States

// Helper function to generate random coordinates around a center point
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

// Los Angeles coordinates
const losAngelesLat = 34.0522;
const losAngelesLng = -118.2437;

// Gas station brand names in the US
const stationBrands = [
  'Shell', 
  'Chevron', 
  'Exxon', 
  'Mobil',
  'BP',
  'Texaco',
  'ARCO',
  '76',
  'Valero',
  'Speedway',
  'Circle K',
  'Costco',
  'Sam\'s Club',
  'Marathon',
  'Sunoco'
];

// Los Angeles area neighborhoods and areas
const losAngelesAreas = [
  'Downtown',
  'Hollywood',
  'Beverly Hills',
  'Santa Monica',
  'Venice',
  'Westwood',
  'Brentwood',
  'Echo Park',
  'Silver Lake',
  'Los Feliz',
  'Koreatown',
  'Culver City',
  'Century City',
  'Chinatown',
  'Burbank',
  'Glendale',
  'Pasadena',
  'Long Beach',
  'Malibu',
  'Marina del Rey'
];

// Los Angeles streets
const losAngelesStreets = [
  'Wilshire Blvd',
  'Sunset Blvd',
  'Santa Monica Blvd',
  'Hollywood Blvd',
  'Melrose Ave',
  'Ventura Blvd',
  'Rodeo Dr',
  'Olympic Blvd',
  'Pico Blvd',
  'La Cienega Blvd',
  'Fairfax Ave',
  'La Brea Ave',
  'Western Ave',
  'Vermont Ave',
  'Figueroa St',
  'Spring St',
  'Main St',
  'Venice Blvd',
  'Lincoln Blvd',
  'Sepulveda Blvd'
];

// Fuel types available in the US with prices in dollars
export const fuelTypes = [
  { id: 'regular', name: 'Regular', price: 3.99 },
  { id: 'midgrade', name: 'Midgrade', price: 4.29 },
  { id: 'premium', name: 'Premium', price: 4.59 },
  { id: 'diesel', name: 'Diesel', price: 4.99 },
  { id: 'e85', name: 'E85', price: 3.49 }
];

// Generate station images
const stationImages = [
  '/lovable-uploads/00333baa-ca73-4e51-8f20-49acab199b5b.png',
  '/lovable-uploads/049ef9d2-46de-4e78-bee2-10fa706d9425.png',
  '/lovable-uploads/8c6a633e-ae68-4424-b2b3-4458a96b7d3b.png',
  '/lovable-uploads/aafa9060-dd0c-4f89-9725-afe221ab74ba.png',
  '/lovable-uploads/ba008608-8960-40b9-8a96-e5b173a48e08.png',
  '/lovable-uploads/c123a960-63f7-48ab-b0a0-6f29584106f7.png',
  '/lovable-uploads/b5fa7932-1a2e-4d11-bb77-3553f76ae527.png'
];

// Generate 100 random gas stations
export const allStations = Array.from({ length: 100 }, (_, i) => {
  const coords = generateRandomCoordinates(losAngelesLat, losAngelesLng, 15);
  const brandName = stationBrands[Math.floor(Math.random() * stationBrands.length)];
  const area = losAngelesAreas[Math.floor(Math.random() * losAngelesAreas.length)];
  const street = losAngelesStreets[Math.floor(Math.random() * losAngelesStreets.length)];
  const streetNumber = Math.floor(Math.random() * 9000) + 1000;
  const distance = (Math.random() * 15).toFixed(1);
  const rating = (3 + Math.random() * 2).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 100) + 5;
  const isOpen = Math.random() > 0.2; // 80% chance of being open
  const imageUrl = stationImages[Math.floor(Math.random() * stationImages.length)];
  
  // Generate random hours
  const openHour = Math.floor(Math.random() * 6) + 5; // 5 AM to 10 AM
  const closeHour = Math.floor(Math.random() * 6) + 18; // 6 PM to 11 PM
  const is24Hours = Math.random() > 0.7; // 30% chance of being 24 hours
  
  // Generate random available fuel types and prices
  const availableFuels = fuelTypes.filter(() => Math.random() > 0.3).map(fuel => ({
    ...fuel,
    price: (fuel.price + (Math.random() * 0.6 - 0.3)).toFixed(2) // Add random price variation in USD
  }));
  
  return {
    id: (i + 1).toString(),
    name: `${brandName} ${area}`,
    address: `${streetNumber} ${street}, ${area}, Los Angeles, CA`,
    distance,
    rating: parseFloat(rating),
    reviewCount,
    isOpen,
    imageUrl,
    position: coords,
    fuels: availableFuels,
    hours: {
      open: is24Hours ? 0 : openHour,
      close: is24Hours ? 24 : closeHour,
      is24Hours
    },
    amenities: {
      hasConvenienceStore: Math.random() > 0.3,
      hasCarWash: Math.random() > 0.7,
      hasRestrooms: Math.random() > 0.2,
      hasATM: Math.random() > 0.5,
      hasFoodService: Math.random() > 0.6
    }
  };
});

// Generate order history items
const orderStatuses = ['completed', 'in transit', 'processing', 'canceled'];

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
    totalPrice: (fuel.price * quantity).toFixed(2),
    orderDate: orderDate.toISOString(),
    status,
    items: [
      { name: `${quantity} Gallon ${fuel.name}`, quantity: '1x', price: parseFloat((fuel.price * quantity).toFixed(2)) },
      ...(Math.random() > 0.7 ? [{ name: 'Snacks', quantity: '2x', price: 4.99 }] : [])
    ],
    driver: Math.random() > 0.5 ? {
      name: 'Mike Johnson',
      location: 'Los Angeles, CA',
      image: '/lovable-uploads/a3df03b1-a154-407f-b8fe-e5dd6f0bade3.png',
      rating: 4.8,
      phone: '+1 323-456-7890'
    } : {
      name: 'Sarah Williams',
      location: 'Los Angeles, CA',
      image: '/lovable-uploads/c3b29f6b-a689-4ac3-a338-4194cbee5e0c.png',
      rating: 4.9,
      phone: '+1 213-987-6543'
    }
  };
});
