import { RawMaterial, Product, UserProfile, Transaction, MarketplaceChannel, StockMovement } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-1',
    name: 'Siti Rahma',
    role: 'admin',
    pin: '8888',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'admin@dapurrasa.id',
    shift: 'General Manager / Owner',
  },
  {
    id: 'u-2',
    name: 'Budi Santoso',
    role: 'cashier',
    pin: '1234',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    email: 'kasir1@dapurrasa.id',
    shift: 'Shift Pagi (07:00 - 15:00)',
  },
  {
    id: 'u-3',
    name: 'Ayu Lestari',
    role: 'cashier',
    pin: '5678',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'kasir2@dapurrasa.id',
    shift: 'Shift Sore (15:00 - 22:00)',
  },
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'rm-1',
    name: 'Tepung Terigu Protein Tinggi (Cakra Kembar)',
    category: 'Tepung & Ragi',
    unit: 'g',
    currentStock: 4500, // 4.5 kg left (min is 5000g -> ALERT!)
    minStock: 5000,
    costPerUnit: 14, // Rp 14 / gram (~Rp 14.000 / kg)
    supplier: 'PT Bogasari Flour Mills',
    lastRestocked: '2026-10-25',
  },
  {
    id: 'rm-2',
    name: 'Butter French Elle & Vire (Unsalted)',
    category: 'Dairy & Butter',
    unit: 'g',
    currentStock: 1800, // 1.8 kg (min is 2500g -> ALERT!)
    minStock: 2500,
    costPerUnit: 180, // Rp 180 / gram (~Rp 45.000 / 250g block)
    supplier: 'CV Mitra Dairy Sejahtera',
    lastRestocked: '2026-10-26',
  },
  {
    id: 'rm-3',
    name: 'Mentega Wijsman Kaleng Premium',
    category: 'Dairy & Butter',
    unit: 'g',
    currentStock: 3200,
    minStock: 2000,
    costPerUnit: 260,
    supplier: 'CV Mitra Dairy Sejahtera',
    lastRestocked: '2026-10-24',
  },
  {
    id: 'rm-4',
    name: 'Telur Ayam Omega Segar',
    category: 'Telur & Isian',
    unit: 'butir',
    currentStock: 18, // 18 butir (min is 30 -> ALERT!)
    minStock: 30,
    costPerUnit: 2200, // Rp 2.200 / butir
    supplier: 'Peternakan Berkah Blitar',
    lastRestocked: '2026-10-27',
  },
  {
    id: 'rm-5',
    name: 'Gula Pasir Kristal Murni',
    category: 'Cokelat & Gula',
    unit: 'g',
    currentStock: 12500,
    minStock: 4000,
    costPerUnit: 18, // Rp 18.000 / kg
    supplier: 'Grosir Sembako Jaya',
    lastRestocked: '2026-10-22',
  },
  {
    id: 'rm-6',
    name: 'Cokelat Batang Callebaut 70% Dark',
    category: 'Cokelat & Gula',
    unit: 'g',
    currentStock: 850, // 850g (min is 1500g -> ALERT!)
    minStock: 1500,
    costPerUnit: 240, // Rp 240 / g
    supplier: 'PT Barry Callebaut Indonesia',
    lastRestocked: '2026-10-20',
  },
  {
    id: 'rm-7',
    name: 'Ragi Instan Saf-Instant Emas',
    category: 'Tepung & Ragi',
    unit: 'g',
    currentStock: 950,
    minStock: 500,
    costPerUnit: 90,
    supplier: 'Toko Bahan Kue 88',
    lastRestocked: '2026-10-24',
  },
  {
    id: 'rm-8',
    name: 'Susu Cair UHT Diamond Full Cream',
    category: 'Dairy & Butter',
    unit: 'ml',
    currentStock: 6000,
    minStock: 3000,
    costPerUnit: 20, // Rp 20 / ml (~Rp 20.000/liter)
    supplier: 'PT Diamond Cold Storage',
    lastRestocked: '2026-10-26',
  },
  {
    id: 'rm-9',
    name: 'Whip Cream Anchor UHT',
    category: 'Dairy & Butter',
    unit: 'ml',
    currentStock: 2200,
    minStock: 2000,
    costPerUnit: 75,
    supplier: 'CV Mitra Dairy Sejahtera',
    lastRestocked: '2026-10-26',
  },
  {
    id: 'rm-10',
    name: 'Keju Cheddar Kraft Shred & Block',
    category: 'Dairy & Butter',
    unit: 'g',
    currentStock: 2400,
    minStock: 1500,
    costPerUnit: 110,
    supplier: 'Toko Bahan Kue 88',
    lastRestocked: '2026-10-23',
  },
  {
    id: 'rm-11',
    name: 'Abon Sapi Asli Spesial Boyolali',
    category: 'Telur & Isian',
    unit: 'g',
    currentStock: 1800,
    minStock: 1000,
    costPerUnit: 190,
    supplier: 'Abon Juara Solo',
    lastRestocked: '2026-10-21',
  },
  {
    id: 'rm-12',
    name: 'Kotak Box Bakery & Paper Bag Kraft',
    category: 'Packaging',
    unit: 'pcs',
    currentStock: 140,
    minStock: 50,
    costPerUnit: 1500,
    supplier: 'Percetakan Kemasan Nusantara',
    lastRestocked: '2026-10-18',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Artisan Butter Croissant',
    category: 'Pastry & Croissant',
    price: 24000,
    costPrice: 8500,
    stock: 22,
    minStock: 8,
    barcode: '899000101',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    isPopular: true,
    recipe: [
      { rawMaterialId: 'rm-1', amount: 50 }, // 50g tepung
      { rawMaterialId: 'rm-2', amount: 30 }, // 30g butter Elle & Vire
      { rawMaterialId: 'rm-8', amount: 20 }, // 20ml susu
      { rawMaterialId: 'rm-7', amount: 3 },  // 3g ragi
      { rawMaterialId: 'rm-5', amount: 5 },  // 5g gula
    ],
  },
  {
    id: 'p-2',
    name: 'Pain Au Chocolat Callebaut',
    category: 'Pastry & Croissant',
    price: 28000,
    costPrice: 11500,
    stock: 5, // LOW STOCK (minStock 8)
    minStock: 8,
    barcode: '899000102',
    image: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    isPopular: true,
    recipe: [
      { rawMaterialId: 'rm-1', amount: 50 },
      { rawMaterialId: 'rm-2', amount: 30 },
      { rawMaterialId: 'rm-6', amount: 25 }, // Cokelat Callebaut
      { rawMaterialId: 'rm-8', amount: 20 },
      { rawMaterialId: 'rm-7', amount: 3 },
    ],
  },
  {
    id: 'p-3',
    name: 'Black Forest Cake Slice',
    category: 'Cake & Tart',
    price: 38000,
    costPrice: 15200,
    stock: 12,
    minStock: 5,
    barcode: '899000103',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    isPopular: true,
    recipe: [
      { rawMaterialId: 'rm-1', amount: 35 },
      { rawMaterialId: 'rm-4', amount: 1 },  // 1 butir telur
      { rawMaterialId: 'rm-6', amount: 30 }, // Cokelat
      { rawMaterialId: 'rm-9', amount: 35 }, // Whip cream
      { rawMaterialId: 'rm-5', amount: 20 },
    ],
  },
  {
    id: 'p-4',
    name: 'Red Velvet Cream Cheese Slice',
    category: 'Cake & Tart',
    price: 42000,
    costPrice: 17000,
    stock: 7,
    minStock: 5,
    barcode: '899000104',
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    isPopular: true,
    recipe: [
      { rawMaterialId: 'rm-1', amount: 40 },
      { rawMaterialId: 'rm-4', amount: 1 },
      { rawMaterialId: 'rm-2', amount: 25 },
      { rawMaterialId: 'rm-9', amount: 40 },
      { rawMaterialId: 'rm-5', amount: 25 },
    ],
  },
  {
    id: 'p-5',
    name: 'Roti Abon Sapi Spesial',
    category: 'Roti Manis',
    price: 18000,
    costPrice: 7200,
    stock: 26,
    minStock: 10,
    barcode: '899000105',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    isPopular: true,
    recipe: [
      { rawMaterialId: 'rm-1', amount: 60 },
      { rawMaterialId: 'rm-2', amount: 15 },
      { rawMaterialId: 'rm-11', amount: 25 }, // Abon sapi
      { rawMaterialId: 'rm-8', amount: 25 },
      { rawMaterialId: 'rm-7', amount: 3 },
    ],
  },
  {
    id: 'p-6',
    name: 'Roti Cokelat Keju Melt',
    category: 'Roti Manis',
    price: 16000,
    costPrice: 6500,
    stock: 30,
    minStock: 10,
    barcode: '899000106',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    recipe: [
      { rawMaterialId: 'rm-1', amount: 55 },
      { rawMaterialId: 'rm-6', amount: 20 },
      { rawMaterialId: 'rm-10', amount: 20 }, // Keju cheddar
      { rawMaterialId: 'rm-2', amount: 12 },
      { rawMaterialId: 'rm-8', amount: 20 },
    ],
  },
  {
    id: 'p-7',
    name: 'Japanese Basque Cheesecake (Mini)',
    category: 'Cake & Tart',
    price: 45000,
    costPrice: 19500,
    stock: 3, // LOW STOCK
    minStock: 6,
    barcode: '899000107',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    recipe: [
      { rawMaterialId: 'rm-9', amount: 60 },
      { rawMaterialId: 'rm-4', amount: 2 },
      { rawMaterialId: 'rm-5', amount: 35 },
      { rawMaterialId: 'rm-2', amount: 20 },
    ],
  },
  {
    id: 'p-8',
    name: 'Nastar Wisman Keju Toples (250g)',
    category: 'Cookies',
    price: 85000,
    costPrice: 38000,
    stock: 15,
    minStock: 5,
    barcode: '899000108',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    recipe: [
      { rawMaterialId: 'rm-3', amount: 60 }, // Wijsman
      { rawMaterialId: 'rm-1', amount: 90 },
      { rawMaterialId: 'rm-4', amount: 1 },
      { rawMaterialId: 'rm-10', amount: 25 },
      { rawMaterialId: 'rm-5', amount: 30 },
    ],
  },
  {
    id: 'p-9',
    name: 'Almond Crispy Tuile Box',
    category: 'Cookies',
    price: 55000,
    costPrice: 22000,
    stock: 18,
    minStock: 6,
    barcode: '899000109',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    recipe: [
      { rawMaterialId: 'rm-2', amount: 40 },
      { rawMaterialId: 'rm-1', amount: 45 },
      { rawMaterialId: 'rm-4', amount: 1 },
      { rawMaterialId: 'rm-5', amount: 35 },
    ],
  },
  {
    id: 'p-10',
    name: 'Donat Glaze Vanilla Choco Crunchy',
    category: 'Roti Manis',
    price: 14000,
    costPrice: 5200,
    stock: 35,
    minStock: 12,
    barcode: '899000110',
    image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    recipe: [
      { rawMaterialId: 'rm-1', amount: 50 },
      { rawMaterialId: 'rm-2', amount: 15 },
      { rawMaterialId: 'rm-6', amount: 15 },
      { rawMaterialId: 'rm-7', amount: 3 },
      { rawMaterialId: 'rm-5', amount: 15 },
    ],
  },
  {
    id: 'p-11',
    name: 'Kopi Susu Gula Aren Barista',
    category: 'Minuman',
    price: 22000,
    costPrice: 7000,
    stock: 50,
    minStock: 15,
    barcode: '899000111',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    recipe: [
      { rawMaterialId: 'rm-8', amount: 160 }, // 160ml fresh milk
      { rawMaterialId: 'rm-5', amount: 20 },
    ],
  },
  {
    id: 'p-12',
    name: 'Iced Matcha Latte Kyoto',
    category: 'Minuman',
    price: 26000,
    costPrice: 9500,
    stock: 40,
    minStock: 15,
    barcode: '899000112',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    isMarketplaceSynced: true,
    recipe: [
      { rawMaterialId: 'rm-8', amount: 180 },
      { rawMaterialId: 'rm-5', amount: 15 },
    ],
  },
];

export const INITIAL_MARKETPLACES: MarketplaceChannel[] = [
  {
    id: 'mp-1',
    name: 'ShopeeFood',
    logoColor: '#EE4D2D',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '2026-10-28 18:45',
    apiKey: 'spf_live_sec_99482103847',
    webhookUrl: 'https://api.dapurrasa.id/webhooks/shopeefood/stock',
    syncItemCount: 12,
  },
  {
    id: 'mp-2',
    name: 'GoFood',
    logoColor: '#00AA13',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '2026-10-28 18:45',
    apiKey: 'gfd_live_sec_77218392019',
    webhookUrl: 'https://api.dapurrasa.id/webhooks/gofood/inventory',
    syncItemCount: 12,
  },
  {
    id: 'mp-3',
    name: 'GrabFood',
    logoColor: '#00B14F',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '2026-10-28 17:30',
    apiKey: 'grb_live_sec_11029485721',
    webhookUrl: 'https://api.dapurrasa.id/webhooks/grabfood/sync',
    syncItemCount: 12,
  },
  {
    id: 'mp-4',
    name: 'Tokopedia',
    logoColor: '#03AC0E',
    isConnected: false,
    autoSync: false,
    lastSyncTime: 'Belum terhubung',
    apiKey: '',
    webhookUrl: 'https://api.dapurrasa.id/webhooks/tokopedia/catalog',
    syncItemCount: 0,
  },
];

// Seed realistic transactions for analytics and monthly reports
export function generateSeedTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const baseTime = new Date('2026-10-28T18:30:00Z').getTime();

  // 14 transactions today & in recent days
  const dummyData = [
    {
      offsetHours: 0.5,
      items: [{ pIndex: 0, qty: 2 }, { pIndex: 10, qty: 2 }],
      method: 'qris' as const,
      cashier: 'Budi Santoso',
      ref: 'QRIS-BCA-98231',
    },
    {
      offsetHours: 1.2,
      items: [{ pIndex: 2, qty: 1 }, { pIndex: 3, qty: 1 }],
      method: 'cash' as const,
      cashier: 'Budi Santoso',
      cashGiven: 100000,
    },
    {
      offsetHours: 2.1,
      items: [{ pIndex: 4, qty: 3 }, { pIndex: 5, qty: 2 }],
      method: 'ewallet' as const,
      cashier: 'Budi Santoso',
      provider: 'GoPay',
    },
    {
      offsetHours: 3.5,
      items: [{ pIndex: 7, qty: 1 }, { pIndex: 0, qty: 1 }],
      method: 'transfer' as const,
      cashier: 'Budi Santoso',
      provider: 'BCA VA',
    },
    {
      offsetHours: 4.8,
      items: [{ pIndex: 1, qty: 2 }, { pIndex: 11, qty: 1 }],
      method: 'qris' as const,
      cashier: 'Budi Santoso',
      ref: 'QRIS-NOBU-77124',
    },
    {
      offsetHours: 6.0,
      items: [{ pIndex: 9, qty: 4 }, { pIndex: 10, qty: 2 }],
      method: 'cash' as const,
      cashier: 'Siti Rahma',
      cashGiven: 100000,
    },
    {
      offsetHours: 7.5,
      items: [{ pIndex: 6, qty: 1 }, { pIndex: 2, qty: 2 }],
      method: 'qris' as const,
      cashier: 'Siti Rahma',
      ref: 'QRIS-MANDIRI-44910',
    },
    // Past days (1-5 days ago)
    {
      offsetHours: 26,
      items: [{ pIndex: 0, qty: 4 }, { pIndex: 7, qty: 2 }],
      method: 'qris' as const,
      cashier: 'Ayu Lestari',
    },
    {
      offsetHours: 30,
      items: [{ pIndex: 3, qty: 2 }, { pIndex: 4, qty: 3 }],
      method: 'cash' as const,
      cashier: 'Ayu Lestari',
      cashGiven: 150000,
    },
    {
      offsetHours: 52,
      items: [{ pIndex: 8, qty: 2 }, { pIndex: 1, qty: 2 }],
      method: 'transfer' as const,
      cashier: 'Budi Santoso',
      provider: 'Mandiri',
    },
    {
      offsetHours: 75,
      items: [{ pIndex: 0, qty: 3 }, { pIndex: 2, qty: 2 }, { pIndex: 10, qty: 3 }],
      method: 'qris' as const,
      cashier: 'Budi Santoso',
    },
    {
      offsetHours: 98,
      items: [{ pIndex: 4, qty: 5 }, { pIndex: 5, qty: 4 }],
      method: 'cash' as const,
      cashier: 'Ayu Lestari',
      cashGiven: 200000,
    },
    {
      offsetHours: 120,
      items: [{ pIndex: 7, qty: 2 }, { pIndex: 8, qty: 1 }],
      method: 'qris' as const,
      cashier: 'Siti Rahma',
    },
    {
      offsetHours: 145,
      items: [{ pIndex: 2, qty: 3 }, { pIndex: 6, qty: 2 }],
      method: 'ewallet' as const,
      cashier: 'Budi Santoso',
      provider: 'ShopeePay',
    },
  ];

  dummyData.forEach((d, idx) => {
    const txDate = new Date(baseTime - d.offsetHours * 3600 * 1000);
    const dateStr = txDate.toISOString();
    const receiptNumber = `DR-2610${String(28 - Math.floor(d.offsetHours / 24)).padStart(2, '0')}-${1000 + idx}`;

    const items = d.items.map(item => {
      const prod = INITIAL_PRODUCTS[item.pIndex];
      const sub = prod.price * item.qty;
      return {
        productId: prod.id,
        productName: prod.name,
        price: prod.price,
        costPrice: prod.costPrice,
        quantity: item.qty,
        subtotal: sub,
      };
    });

    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const tax = Math.round(subtotal * 0.1);
    const discount = 0;
    const total = subtotal + tax - discount;
    const totalCost = items.reduce((acc, it) => acc + (it.costPrice * it.quantity), 0);
    const grossProfit = total - tax - totalCost;

    transactions.push({
      id: `tx-${idx + 1}`,
      receiptNumber,
      date: dateStr,
      cashierId: d.cashier === 'Siti Rahma' ? 'u-1' : (d.cashier === 'Budi Santoso' ? 'u-2' : 'u-3'),
      cashierName: d.cashier,
      items,
      subtotal,
      tax,
      discount,
      total,
      totalCost,
      grossProfit,
      paymentMethod: d.method,
      paymentDetails: {
        cashGiven: d.cashGiven || (d.method === 'cash' ? total : undefined),
        change: d.cashGiven ? (d.cashGiven - total) : 0,
        provider: d.provider || (d.method === 'qris' ? 'QRIS GPN' : undefined),
        refNumber: d.ref || `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });
  });

  return transactions;
}

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-1',
    date: '2026-10-28 17:30',
    type: 'sale',
    itemType: 'product',
    itemId: 'p-1',
    itemName: 'Artisan Butter Croissant',
    amount: -2,
    stockBefore: 24,
    stockAfter: 22,
    unit: 'pcs',
    notes: 'Penjualan Nota DR-261028-1000',
    operatorName: 'Budi Santoso',
  },
  {
    id: 'sm-2',
    date: '2026-10-28 17:30',
    type: 'sale',
    itemType: 'raw_material',
    itemId: 'rm-1',
    itemName: 'Tepung Terigu Protein Tinggi',
    amount: -100,
    stockBefore: 4600,
    stockAfter: 4500,
    unit: 'g',
    notes: 'Konsumsi Resep 2x Butter Croissant',
    operatorName: 'Sistem POS Otomatis',
  },
  {
    id: 'sm-3',
    date: '2026-10-28 14:00',
    type: 'restock',
    itemType: 'raw_material',
    itemId: 'rm-8',
    itemName: 'Susu Cair UHT Diamond Full Cream',
    amount: 5000,
    stockBefore: 1000,
    stockAfter: 6000,
    unit: 'ml',
    notes: 'Pengiriman PO #772 dari Mitra Dairy',
    operatorName: 'Siti Rahma',
  },
  {
    id: 'sm-4',
    date: '2026-10-28 09:15',
    type: 'adjustment',
    itemType: 'product',
    itemId: 'p-2',
    itemName: 'Pain Au Chocolat Callebaut',
    amount: -3,
    stockBefore: 8,
    stockAfter: 5,
    unit: 'pcs',
    notes: 'Koreksi Display & Tester Pelanggan',
    operatorName: 'Budi Santoso',
  },
];
