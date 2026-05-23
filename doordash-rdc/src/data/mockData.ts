import { Category, Restaurant, MenuItem, Promotion, Order } from '../types';

export interface Store extends Restaurant {
  type: 'grocery' | 'supermarket' | 'alcohol' | 'flowers' | 'pharmacy' | 'pet';
}

// Onglets barre d'accueil — ordre canonique (fusionné avec l'API si des slugs manquent)
export const MAIN_CATEGORIES = [
  { id: 'restaurants', name: 'Restaurants', icon: 'restaurant-outline' },
  { id: 'grocery', name: 'Épicerie', icon: 'cart-outline' },
  { id: 'supermarket', name: 'Supermarché', icon: 'storefront-outline' },
  { id: 'alcohol', name: 'Alcool', icon: 'wine-outline' },
  { id: 'flowers', name: 'Fleurs', icon: 'flower-outline' },
  { id: 'pharmacy', name: 'Pharmacie', icon: 'medical-outline' },
  { id: 'pet', name: 'Animalerie', icon: 'paw-outline' },
];

// Grocery stores
export const GROCERY_STORES: Store[] = [
  { id: 'g1', name: 'Marché de la Gombe', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', rating: 4.5, reviewCount: 189, deliveryTime: '30-45 min', deliveryFee: 2000, categories: ['Épicerie', 'Fruits & Légumes'], distance: '1.5 km', minOrder: 5000, isOpen: true, type: 'grocery' },
  { id: 'g2', name: 'Super U Kinshasa', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c8a?w=800', rating: 4.3, reviewCount: 267, deliveryTime: '40-55 min', deliveryFee: 2500, categories: ['Supermarché'], distance: '3.2 km', minOrder: 8000, isOpen: true, type: 'grocery' },
  { id: 'g3', name: 'Fruits Frais Kin', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800', rating: 4.7, reviewCount: 98, deliveryTime: '20-30 min', deliveryFee: 1500, categories: ['Fruits & Légumes'], distance: '0.8 km', isNew: true, minOrder: 3000, isOpen: true, type: 'grocery' },
];

// Alcohol stores
export const ALCOHOL_STORES: Store[] = [
  { id: 'a1', name: 'Cave des Saveurs', image: 'https://images.unsplash.com/photo-1558642452-9a6709322865?w=800', rating: 4.6, reviewCount: 145, deliveryTime: '30-40 min', deliveryFee: 2000, categories: ['Vins', 'Bières'], distance: '2.1 km', minOrder: 10000, isOpen: true, type: 'alcohol' },
  { id: 'a2', name: 'Primeurs Kinshasa', image: 'https://images.unsplash.com/photo-1470337458706-46ad17657524?w=800', rating: 4.4, reviewCount: 89, deliveryTime: '25-35 min', deliveryFee: 1500, categories: ['Spirits', 'Vins'], distance: '1.8 km', minOrder: 8000, isOpen: true, type: 'alcohol' },
];

// Flower shops
export const FLOWER_SHOPS: Store[] = [
  { id: 'f1', name: 'Fleurs de Kin', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800', rating: 4.8, reviewCount: 76, deliveryTime: '45-60 min', deliveryFee: 3000, categories: ['Bouquets', 'Occasions'], distance: '2.5 km', minOrder: 15000, isOpen: true, type: 'flowers' },
  { id: 'f2', name: 'Jardin Fleuri', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800', rating: 4.6, reviewCount: 54, deliveryTime: '35-50 min', deliveryFee: 2500, categories: ['Plantes', 'Bouquets'], distance: '1.9 km', isNew: true, minOrder: 10000, isOpen: true, type: 'flowers' },
];

// Pharmacies
export const PHARMACIES: Store[] = [
  { id: 'p1', name: 'Pharmacie de la Paix', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800', rating: 4.9, reviewCount: 234, deliveryTime: '20-30 min', deliveryFee: 1500, categories: ['Médicaments', 'Soins'], distance: '0.5 km', minOrder: 2000, isOpen: true, type: 'pharmacy' },
  { id: 'p2', name: 'Pharmacie Centrale', image: 'https://images.unsplash.com/photo-1576602976047-17430ea54360?w=800', rating: 4.7, reviewCount: 178, deliveryTime: '25-35 min', deliveryFee: 1500, categories: ['Médicaments', 'Bébé'], distance: '1.2 km', minOrder: 2000, isOpen: true, type: 'pharmacy' },
];

// Pet stores
export const PET_STORES: Store[] = [
  { id: 'pt1', name: 'Animalerie Kin', image: 'https://images.unsplash.com/photo-1545249390-6b88f8e76962?w=800', rating: 4.5, reviewCount: 67, deliveryTime: '30-45 min', deliveryFee: 2000, categories: ['Nourriture', 'Accessoires'], distance: '2.8 km', minOrder: 5000, isOpen: true, type: 'pet' },
  { id: 'pt2', name: 'Pet Shop Gombe', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800', rating: 4.3, reviewCount: 45, deliveryTime: '35-50 min', deliveryFee: 2500, categories: ['Nourriture', 'Hygiène'], distance: '1.6 km', minOrder: 4000, isOpen: true, type: 'pet' },
];

// Grocery products (items within a grocery store)
export const GROCERY_ITEMS: Record<string, any[]> = {
  g1: [
    { id: 'gr1', storeId: 'g1', name: 'Bananes', description: 'Bananes fraîches du Congo', price: 1500, category: 'Fruits', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', unit: 'tas' },
    { id: 'gr2', storeId: 'g1', name: 'Tomates', description: 'Tomates rouges fraîches', price: 2000, category: 'Légumes', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400', unit: 'kg' },
    { id: 'gr3', storeId: 'g1', name: 'Riz (5kg)', description: 'Riz de qualité supérieure', price: 8500, category: 'Céréales', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', unit: 'sac' },
    { id: 'gr4', storeId: 'g1', name: 'Huile végétale (1L)', description: 'Huile de palme raffinée', price: 3500, category: 'Huiles', image: 'https://images.unsplash.com/photo-1474979266058-3f0d34566238?w=400', unit: 'bouteille' },
    { id: 'gr5', storeId: 'g1', name: 'Farine de maïs (2kg)', description: 'Farine pour fufu', price: 4000, category: 'Farines', image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=400', unit: 'paquet' },
    { id: 'gr6', storeId: 'g1', name: 'Lait (1L)', description: 'Lait frais entier', price: 2500, category: 'Produits laitiers', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', unit: 'brique' },
  ],
};

// Alcohol products
export const ALCOHOL_ITEMS: Record<string, any[]> = {
  a1: [
    { id: 'al1', storeId: 'a1', name: 'Primus', description: 'Bière locale rafraîchissante', price: 1500, category: 'Bières', image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400', unit: 'bouteille' },
    { id: 'al2', storeId: 'a1', name: 'Simba', description: 'Bière blonde congolaise', price: 1500, category: 'Bières', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', unit: 'bouteille' },
    { id: 'al3', storeId: 'a1', name: 'Vin Rouge Bordeaux', description: 'Vin français importé', price: 15000, category: 'Vins', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', unit: 'bouteille' },
  ],
};

// Flower products
export const FLOWER_ITEMS: Record<string, any[]> = {
  f1: [
    { id: 'fl1', storeId: 'f1', name: 'Bouquet Romance', description: 'Roses rouges et blanches avec feuillage frais', price: 25000, category: 'Romantique', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400', occasion: 'Romantique' },
    { id: 'fl2', storeId: 'f1', name: 'Bouquet Anniversaire', description: 'Mélange coloré de roses, lys et marguerites', price: 20000, category: 'Anniversaire', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400', occasion: 'Anniversaire' },
    { id: 'fl3', storeId: 'f1', name: 'Couronne Funéraire', description: 'Composition élégante de lys blancs et chrysanthèmes', price: 45000, category: 'Deuil', image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400', occasion: 'Deuil' },
    { id: 'fl4', storeId: 'f1', name: 'Bouquet Mariage', description: 'Pivoines blanches et roses avec eucalyptus', price: 55000, category: 'Mariage', image: 'https://images.unsplash.com/photo-1522057306606-8d84b8a1f8d5?w=400', occasion: 'Mariage' },
    { id: 'fl5', storeId: 'f1', name: 'Bouquet Félicitations', description: 'Tournesols et gerberas joyeux pour célébrer', price: 18000, category: 'Congratulations', image: 'https://images.unsplash.com/photo-1468327768598-845c0e0e1578?w=400', occasion: 'Congratulations' },
    { id: 'fl6', storeId: 'f1', name: 'Orchidée en Pot', description: 'Orchidée phalaenopsis en pot décoratif', price: 30000, category: 'Plantes', image: 'https://images.unsplash.com/photo-1524598171276-65ef843f6564?w=400', occasion: 'Tous' },
  ],
  f2: [
    { id: 'fl7', storeId: 'f2', name: 'Bouquet Soleil', description: 'Tournesols frais avec feuillage vert', price: 15000, category: 'Congratulations', image: 'https://images.unsplash.com/photo-1551945326-df678cee4e94?w=400', occasion: 'Congratulations' },
    { id: 'fl8', storeId: 'f2', name: 'Rose Éternelle', description: 'Rose préservée sous cloche en verre', price: 35000, category: 'Romantique', image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400', occasion: 'Romantique' },
    { id: 'fl9', storeId: 'f2', name: 'Jardinière Printemps', description: 'Tulipes et jonquilles en jardinière', price: 22000, category: 'Anniversaire', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400', occasion: 'Anniversaire' },
  ],
};

// Pharmacy products
export const PHARMACY_ITEMS: Record<string, any[]> = {
  p1: [
    { id: 'ph1', storeId: 'p1', name: 'Paracétamol 500mg', description: 'Comprimés contre la douleur et la fièvre, boîte de 16', price: 2500, category: 'Médicaments', image: 'https://images.unsplash.com/photo-1584308666744-24d5c478f2ae?w=400', prescription: false, dosage: '1-2 comprimés toutes les 6h' },
    { id: 'ph2', storeId: 'p1', name: 'Amoxicilline 500mg', description: 'Antibiotique, boîte de 12 gélules', price: 8000, category: 'Médicaments', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070e03e?w=400', prescription: true, dosage: '1 gélule 3x/jour pendant 7 jours' },
    { id: 'ph3', storeId: 'p1', name: 'Crème Solaire SPF50', description: 'Protection solaire haute, tube 50ml', price: 12000, category: 'Soins', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', prescription: false, dosage: '' },
    { id: 'ph4', storeId: 'p1', name: 'Vitamine C 1000mg', description: 'Comprimés effervescents, tube de 10', price: 5000, category: 'Vitamines', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', prescription: false, dosage: '1 comprimé/jour' },
    { id: 'ph5', storeId: 'p1', name: 'Lait Bébé Premium', description: 'Lait infantile 1er âge, boîte 900g', price: 18000, category: 'Bébé', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400', prescription: false, dosage: '' },
    { id: 'ph6', storeId: 'p1', name: 'Trousse Premiers Soins', description: 'Kit complet avec pansements, antiseptique, ciseaux', price: 15000, category: 'Premiers soins', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', prescription: false, dosage: '' },
    { id: 'ph7', storeId: 'p1', name: 'Ibuprofène 400mg', description: 'Anti-inflammatoire, boîte de 20 comprimés', price: 4500, category: 'Médicaments', image: 'https://images.unsplash.com/photo-1584308666744-24d5c478f2ae?w=400', prescription: false, dosage: '1 comprimé 3x/jour après repas' },
  ],
  p2: [
    { id: 'ph8', storeId: 'p2', name: 'Doliprane 1000mg', description: 'Paracétamol, boîte de 8 comprimés', price: 3500, category: 'Médicaments', image: 'https://images.unsplash.com/photo-1584308666744-24d5c478f2ae?w=400', prescription: false, dosage: '1 comprimé toutes les 6h' },
    { id: 'ph9', storeId: 'p2', name: 'Sirop Toux Enfant', description: 'Sirop calmant pour enfants, flacon 150ml', price: 6000, category: 'Bébé', image: 'https://images.unsplash.com/photo-1576602976047-17430ea54360?w=400', prescription: false, dosage: '5ml 3x/jour' },
    { id: 'ph10', storeId: 'p2', name: 'Multivitamines', description: 'Complément alimentaire, boîte de 30', price: 12000, category: 'Vitamines', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', prescription: false, dosage: '1 comprimé/jour au petit-déjeuner' },
  ],
};

// Pet store products
export const PET_ITEMS: Record<string, any[]> = {
  pt1: [
    { id: 'pt1', storeId: 'pt1', name: 'Croquettes Chien Premium', description: 'Nourriture sèche pour chien adulte, sac 10kg', price: 25000, category: 'Nourriture', image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400', petType: 'Chien' },
    { id: 'pt2', storeId: 'pt1', name: 'Pâtée Chat Saumon', description: 'Nourriture humide au saumon, lot de 12', price: 8000, category: 'Nourriture', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', petType: 'Chat' },
    { id: 'pt3', storeId: 'pt1', name: 'Collier Anti-Puces', description: 'Collier protecteur 8 mois, taille ajustable', price: 12000, category: 'Hygiène', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', petType: 'Chien' },
    { id: 'pt4', storeId: 'pt1', name: 'Jouet Balle Interactive', description: 'Balle distributrice de croquettes', price: 5000, category: 'Jouets', image: 'https://images.unsplash.com/photo-1545249390-6b88f8e76962?w=400', petType: 'Chien' },
    { id: 'pt5', storeId: 'pt1', name: 'Laisse Rétractable', description: 'Laisse 5m avec système de verrouillage', price: 15000, category: 'Accessoires', image: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400', petType: 'Chien' },
    { id: 'pt6', storeId: 'pt1', name: 'Griffoir Chat', description: 'Arbre à gratter avec plateforme, 80cm', price: 20000, category: 'Accessoires', image: 'https://images.unsplash.com/photo-1545249390-6b88f8e76962?w=400', petType: 'Chat' },
  ],
  pt2: [
    { id: 'pt7', storeId: 'pt2', name: 'Croquettes Chiot', description: 'Nourriture spéciale croissance, sac 5kg', price: 18000, category: 'Nourriture', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', petType: 'Chien' },
    { id: 'pt8', storeId: 'pt2', name: 'Litière Agglomérante', description: 'Litière parfum lavande, sac 10L', price: 7000, category: 'Hygiène', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', petType: 'Chat' },
    { id: 'pt9', storeId: 'pt2', name: 'Gamelle Anti-Glouton', description: 'Gamelle ralentisseur de repas', price: 8000, category: 'Accessoires', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', petType: 'Chien' },
    { id: 'pt10', storeId: 'pt2', name: 'Souris Jouet Chat', description: 'Lot de 5 souris avec herbe à chat', price: 3000, category: 'Jouets', image: 'https://images.unsplash.com/photo-1545249390-6b88f8e76962?w=400', petType: 'Chat' },
  ],
};

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Fast Food', icon: 'fast-food-outline', color: '#FF6B00' },
  { id: '2', name: 'Asiatique', icon: 'restaurant', color: '#FF0000' },
  { id: '3', name: 'Pizza', icon: 'pizza', color: '#FFB800' },
  { id: '4', name: 'Burger', icon: 'fast-food-outline', color: '#8B4513' },
  { id: '5', name: 'Healthy', icon: 'leaf-outline', color: '#00A650' },
  { id: '6', name: 'Desserts', icon: 'ice-cream-outline', color: '#FF69B4' },
  { id: '7', name: 'Boissons', icon: 'cafe-outline', color: '#4169E1' },
  { id: '8', name: 'Local', icon: 'flame-outline', color: '#9C27B0' },
  { id: '9', name: 'Poulet', icon: 'bonfire-outline', color: '#E65100' },
  { id: '10', name: 'Poisson', icon: 'fish-outline', color: '#00BCD4' },
  { id: '11', name: 'Petit dej', icon: 'sunny-outline', color: '#FFC107' },
  { id: '12', name: 'Autres', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Chez Mama K',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    rating: 4.8,
    reviewCount: 342,
    deliveryTime: '25-35 min',
    deliveryFee: 1500,
    categories: ['Local', 'Poulet', 'Fast Food'],
    distance: '1.2 km',
    isPromoted: true,
    discount: '-20%',
    minOrder: 5000,
    isOpen: true,
    featured: true,
  },
  {
    id: 'r2',
    name: 'Pizza Palace Kin',
    image: 'https://images.unsplash.com/photo-1604382355076-af83f3e6e05a?w=800',
    rating: 4.6,
    reviewCount: 218,
    deliveryTime: '30-40 min',
    deliveryFee: 2000,
    categories: ['Pizza', 'Fast Food'],
    distance: '2.5 km',
    isNew: true,
    minOrder: 8000,
    isOpen: true,
    featured: true,
  },
  {
    id: 'r3',
    name: 'Le Gourmet Asiatique',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    rating: 4.9,
    reviewCount: 156,
    deliveryTime: '35-45 min',
    deliveryFee: 2500,
    categories: ['Asiatique'],
    distance: '3.1 km',
    minOrder: 10000,
    isOpen: true,
  },
  {
    id: 'r4',
    name: 'Burger House Goma',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
    rating: 4.5,
    reviewCount: 289,
    deliveryTime: '20-30 min',
    deliveryFee: 1000,
    categories: ['Burger', 'Fast Food'],
    distance: '0.8 km',
    isPromoted: true,
    minOrder: 4000,
    isOpen: true,
    featured: true,
  },
  {
    id: 'r5',
    name: 'Green Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    rating: 4.7,
    reviewCount: 98,
    deliveryTime: '25-35 min',
    deliveryFee: 1500,
    categories: ['Healthy'],
    distance: '1.8 km',
    isNew: true,
    minOrder: 6000,
    isOpen: true,
  },
  {
    id: 'r6',
    name: 'Sweet Dreams Bakery',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
    rating: 4.8,
    reviewCount: 175,
    deliveryTime: '20-30 min',
    deliveryFee: 1000,
    categories: ['Desserts', 'Petit dej'],
    distance: '1.5 km',
    discount: '-15%',
    minOrder: 3000,
    isOpen: true,
    featured: true,
  },
  {
    id: 'r7',
    name: 'Braza Grillade',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    rating: 4.6,
    reviewCount: 234,
    deliveryTime: '30-45 min',
    deliveryFee: 2000,
    categories: ['Local', 'Poulet'],
    distance: '2.2 km',
    minOrder: 7000,
    isOpen: true,
  },
  {
    id: 'r8',
    name: 'Ocean Fresh Fish',
    image: 'https://images.unsplash.com/photo-1615141982880-1313d41820ce?w=800',
    rating: 4.4,
    reviewCount: 87,
    deliveryTime: '35-50 min',
    deliveryFee: 3000,
    categories: ['Poisson'],
    distance: '4.5 km',
    minOrder: 12000,
    isOpen: false,
  },
  {
    id: 'r9',
    name: 'Café Lubumbashi',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    rating: 4.9,
    reviewCount: 312,
    deliveryTime: '15-25 min',
    deliveryFee: 500,
    categories: ['Boissons', 'Petit dej'],
    distance: '0.5 km',
    isPromoted: true,
    discount: '-10%',
    minOrder: 2000,
    isOpen: true,
    featured: true,
  },
  {
    id: 'r10',
    name: 'Shawarma Express',
    image: 'https://images.unsplash.com/photo-1561651188-d20e6b497947?w=800',
    rating: 4.3,
    reviewCount: 145,
    deliveryTime: '20-30 min',
    deliveryFee: 1000,
    categories: ['Fast Food', 'Asiatique'],
    distance: '1.1 km',
    isNew: true,
    minOrder: 4000,
    isOpen: true,
  },
];

export const MENU_ITEMS: Record<string, MenuItem[]> = {
  r1: [
    { id: 'm1', restaurantId: 'r1', name: 'Poulet Moambe', description: 'Poulet sauce moambe avec riz et fufu', price: 8500, category: 'Plats principaux', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', isPopular: true },
    { id: 'm2', restaurantId: 'r1', name: 'Fumbwa', description: 'Feuilles de fumbwa avec poisson fumé', price: 6000, category: 'Plats principaux', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
    { id: 'm3', restaurantId: 'r1', name: 'Brochettes de Poulet', description: '3 brochettes avec frites et salade', price: 5500, category: 'Grillades', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', isPopular: true },
    { id: 'm4', restaurantId: 'r1', name: 'Fufu + Sauce Arachide', description: 'Fufu maison avec sauce arachide et viande', price: 4500, category: 'Plats principaux' },
    { id: 'm5', restaurantId: 'r1', name: 'Poulet Braisé', description: 'Demi poulet braisé avec frites', price: 9000, category: 'Grillades', isPopular: true },
  ],
  r2: [
    { id: 'm6', restaurantId: 'r2', name: 'Pizza Margherita', description: 'Tomate, mozzarella, basilic frais', price: 12000, category: 'Pizzas', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', isPopular: true },
    { id: 'm7', restaurantId: 'r2', name: 'Pizza Pepperoni', description: 'Pepperoni, mozzarella, sauce tomate', price: 14000, category: 'Pizzas', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
    { id: 'm8', restaurantId: 'r2', name: 'Pizza 4 Fromages', description: 'Mozzarella, gorgonzola, parmesan, chèvre', price: 16000, category: 'Pizzas' },
    { id: 'm9', restaurantId: 'r2', name: 'Calzone', description: 'Pizza pliée jambon champignon', price: 13000, category: 'Pizzas' },
  ],
  r4: [
    { id: 'm10', restaurantId: 'r4', name: 'Classic Burger', description: 'Steak haché, cheddar, salade, tomate, oignons', price: 7000, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', isPopular: true },
    { id: 'm11', restaurantId: 'r4', name: 'Double Cheese Burger', description: 'Double steak, double cheddar, bacon', price: 10000, category: 'Burgers', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
    { id: 'm12', restaurantId: 'r4', name: 'Chicken Burger', description: 'Poulet croustillant, mayo, salade', price: 8000, category: 'Burgers' },
    { id: 'm13', restaurantId: 'r4', name: 'Frites Maison', description: 'Portion de frites croustillantes', price: 2500, category: 'Accompagnements' },
  ],
  r5: [
    { id: 'm14', restaurantId: 'r5', name: 'Salade César', description: 'Poulet grillé, parmesan, croutons, sauce César', price: 7500, category: 'Salades', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', isPopular: true },
    { id: 'm15', restaurantId: 'r5', name: 'Bowl Avocat Saumon', description: 'Saumon frais, avocat, riz, edamame', price: 12000, category: 'Bowls', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
    { id: 'm16', restaurantId: 'r5', name: 'Smoothie Vert', description: 'Épinard, banane, mangue, gingembre', price: 3500, category: 'Boissons' },
  ],
  r6: [
    { id: 'm17', restaurantId: 'r6', name: 'Gâteau au Chocolat', description: 'Fondant au chocolat noir', price: 4000, category: 'Gâteaux', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', isPopular: true },
    { id: 'm18', restaurantId: 'r6', name: 'Croissant Beurre', description: 'Croissant feuilleté au beurre', price: 2000, category: 'Viennoiseries' },
    { id: 'm19', restaurantId: 'r6', name: 'Tiramisu', description: 'Tiramisu traditionnel italien', price: 5000, category: 'Gâteaux' },
    { id: 'm20', restaurantId: 'r6', name: 'Milkshake', description: 'Vanille, fraise ou chocolat', price: 3500, category: 'Boissons' },
  ],
};

export const PROMOTIONS: Promotion[] = [
  { id: 'p1', title: '-20% sur votre première commande', description: 'Utilisez le code BIENVENUE', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', code: 'BIENVENUE', discount: '20%', expiryDate: '2026-06-30' },
  { id: 'p2', title: 'Livraison gratuite', description: 'Sur les commandes +15000 FC', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', discount: 'Livraison OFFERTE', expiryDate: '2026-05-15' },
  { id: 'p3', title: 'Happy Hour Burger', description: '-30% de 14h à 17h', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', discount: '30%', expiryDate: '2026-05-31' },
];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'o1',
    restaurant: RESTAURANTS[0],
    items: [
      { lineId: 'mock-o1-a', menuItem: MENU_ITEMS['r1'][0], quantity: 2, selectedOptions: [] },
      { lineId: 'mock-o1-b', menuItem: MENU_ITEMS['r1'][2], quantity: 1, selectedOptions: [] },
    ],
    subtotal: 22500,
    deliveryFee: 1500,
    serviceFee: 1000,
    tax: 0,
    tip: 2000,
    total: 27000,
    status: 'delivering',
    createdAt: '2026-04-30T12:30:00Z',
    deliveryAddress: '123 Ave Kasa-Vubu, Gombe',
    paymentMethod: 'M-Pesa',
    estimatedDeliveryTime: '13:05',
    driver: {
      id: 'd1',
      name: 'Patrick M.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      rating: 4.9,
      deliveries: 432,
      vehicle: 'Moto',
    },
  },
  {
    id: 'o2',
    restaurant: RESTAURANTS[3],
    items: [
      { lineId: 'mock-o2-a', menuItem: MENU_ITEMS['r4'][0], quantity: 1, selectedOptions: [] },
    ],
    subtotal: 7000,
    deliveryFee: 1000,
    serviceFee: 500,
    tax: 0,
    tip: 1000,
    total: 9500,
    status: 'delivered',
    createdAt: '2026-04-29T19:00:00Z',
    deliveryAddress: '45 Blvd du 30 Juin, Gombe',
    paymentMethod: 'Cash',
    estimatedDeliveryTime: '19:25',
  },
];
