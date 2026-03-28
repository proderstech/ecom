/* ── Product Catalogue Data ── */
export const PRODUCTS = [
  /* ── WINE ── */
  { id: 1, name: 'Château Margaux 2018', category: 'Wine', subcategory: 'Red Wine', brand: 'Château Margaux', price: 89.99, abv: '13.5%', volume: '750ml', country: 'France', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&q=80', stock: 24, badge: 'Premium', rating: 4.9, description: 'A world-renowned Bordeaux with complex notes of blackcurrant, cedar, and subtle spice. Perfect for special occasions.' },
  { id: 2, name: 'Whispering Angel Rosé', category: 'Wine', subcategory: 'Rosé Wine', brand: 'Whispering Angel', price: 34.99, abv: '13%', volume: '750ml', country: 'France', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80', stock: 48, badge: 'Bestseller', rating: 4.7, description: 'The iconic Provence rosé beloved by celebrities and wine enthusiasts. Crisp, dry with notes of peach and cream.' },
  { id: 3, name: 'Kim Crawford Sauvignon Blanc', category: 'Wine', subcategory: 'White Wine', brand: 'Kim Crawford', price: 18.99, abv: '13%', volume: '750ml', country: 'New Zealand', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&q=80', stock: 60, badge: null, rating: 4.5, description: 'Fresh and vibrant with tropical fruit flavours. The benchmark New Zealand Sauvignon Blanc.' },
  { id: 4, name: 'Veuve Clicquot Brut NV', category: 'Wine', subcategory: 'Champagne', brand: 'Veuve Clicquot', price: 54.99, abv: '12%', volume: '750ml', country: 'France', image: 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=500&q=80', stock: 30, badge: 'Luxury', rating: 4.8, description: 'The iconic Yellow Label Champagne. Rich, toasty and elegantly balanced with fine persistent bubbles.' },

  /* ── WHISKY ── */
  { id: 5, name: 'Glenfiddich 18 Year Old', category: 'Whisky', subcategory: 'Single Malt Scotch', brand: 'Glenfiddich', price: 79.99, abv: '40%', volume: '700ml', country: 'Scotland', image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&q=80', stock: 18, badge: 'Award Winner', rating: 4.9, description: 'Matured for 18 years in the finest Spanish Oloroso Sherry and American bourbon casks. Rich and complex.' },
  { id: 6, name: 'Macallan 12 Double Cask', category: 'Whisky', subcategory: 'Single Malt Scotch', brand: 'The Macallan', price: 64.99, abv: '40%', volume: '700ml', country: 'Scotland', image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=500&q=80', stock: 22, badge: 'Premium', rating: 4.8, description: 'Matured in a combination of American and European oak sherry seasoned casks for a rich, sweet taste.' },
  { id: 7, name: "Woodford Reserve Bourbon", category: 'Whisky', subcategory: 'Bourbon', brand: 'Woodford Reserve', price: 44.99, abv: '43.2%', volume: '700ml', country: 'USA', image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&q=80', stock: 35, badge: null, rating: 4.6, description: "Kentucky's finest small batch bourbon. Rich, full-bodied with notes of dried fruit, vanilla and sweet oak." },
  { id: 8, name: 'Jameson Irish Whiskey', category: 'Whisky', subcategory: 'Irish Whiskey', brand: 'Jameson', price: 32.99, abv: '40%', volume: '700ml', country: 'Ireland', image: 'https://images.unsplash.com/photo-1608885898957-e9e84a2f7b5a?w=500&q=80', stock: 50, badge: 'Bestseller', rating: 4.5, description: "Ireland's best-selling whiskey. Smooth and balanced with notes of vanilla, spice and toasted wood." },

  /* ── BEER ── */
  { id: 9, name: 'London Pride (12-Pack)', category: 'Beer', subcategory: 'Ale', brand: "Fuller's", price: 22.99, abv: '4.1%', volume: '12 × 500ml', country: 'UK', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&q=80', stock: 40, badge: 'London Craft', rating: 4.6, description: "London's favourite ale. A beautifully balanced beer with a rich malt flavour and great depth of flavour." },
  { id: 10, name: 'Peroni Nastro Azzurro (24-Pack)', category: 'Beer', subcategory: 'Lager', brand: 'Peroni', price: 28.99, abv: '5.1%', volume: '24 × 330ml', country: 'Italy', image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&q=80', stock: 55, badge: null, rating: 4.4, description: 'Italy\'s premium lager. Crisp, refreshing with a delicate balance of bitterness and citrus notes.' },
  { id: 11, name: 'Camden Hells Lager (6-Pack)', category: 'Beer', subcategory: 'Craft Lager', brand: 'Camden Town', price: 14.99, abv: '4.6%', volume: '6 × 330ml', country: 'UK', image: 'https://images.unsplash.com/photo-1613575832000-4de5e8a3a1aa?w=500&q=80', stock: 30, badge: 'Local', rating: 4.7, description: 'The taste of Camden. The most carefully crafted lager. Unfiltered, unpasteurised and uncompromising.' },

  /* ── SPIRITS ── */
  { id: 12, name: "Belvedere Pure Vodka", category: 'Spirits', subcategory: 'Vodka', brand: 'Belvedere', price: 42.99, abv: '40%', volume: '700ml', country: 'Poland', image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=500&q=80', stock: 28, badge: 'Ultra-Premium', rating: 4.8, description: 'Poland\'s finest super-premium vodka. Quadruple distilled from 100% Dankowskie Gold Rye.' },
  { id: 13, name: 'Hendricks Gin', category: 'Spirits', subcategory: 'Gin', brand: "Hendrick's", price: 38.99, abv: '41.4%', volume: '700ml', country: 'Scotland', image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80', stock: 42, badge: 'Premium', rating: 4.7, description: 'A superbly balanced Scottish gin infused with cucumber and rose petals. Unusual yet remarkably refreshing.' },
  { id: 14, name: 'Don Julio Blanco Tequila', category: 'Spirits', subcategory: 'Tequila', brand: 'Don Julio', price: 52.99, abv: '40%', volume: '700ml', country: 'Mexico', image: 'https://images.unsplash.com/photo-1548197543-6d2a7ce1be4b?w=500&q=80', stock: 20, badge: null, rating: 4.6, description: 'Premium 100% Blue Agave tequila. Clean, crisp and smooth with a refreshing citrus finish.' },

  /* ── GROCERIES ── */
  { id: 15, name: 'Organic Full-Fat Milk (4 Pints)', category: 'Groceries', subcategory: 'Dairy', brand: 'Waitrose Essentials', price: 2.49, abv: null, volume: '2.27L', country: 'UK', image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&q=80', stock: 100, badge: 'Organic', rating: 4.3, description: 'Organic full-fat milk from free-range British farms. Fresh and delivered the same day.' },
  { id: 16, name: 'Sourdough Bread Loaf', category: 'Groceries', subcategory: 'Bakery', brand: 'London Bakehouse', price: 3.99, abv: null, volume: '800g', country: 'UK', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&q=80', stock: 45, badge: 'Artisan', rating: 4.8, description: 'Traditional slow-fermented sourdough. Crusty outside, chewy inside with a tangy flavour.' },
  { id: 17, name: 'Premium Cadbury Hamper', category: 'Groceries', subcategory: 'Snacks', brand: 'Cadbury', price: 24.99, abv: null, volume: '1.2kg', country: 'UK', image: 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?w=500&q=80', stock: 25, badge: 'Gift', rating: 4.5, description: 'A delightful selection of Cadbury\'s finest chocolates, perfect for gifting or personal indulgence.' },
  { id: 18, name: 'Maldon Sea Salt Flakes', category: 'Groceries', subcategory: 'Pantry', brand: 'Maldon', price: 4.99, abv: null, volume: '250g', country: 'UK', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500&q=80', stock: 80, badge: null, rating: 4.9, description: 'The iconic British sea salt. Pyramid-shaped flakes with a clean, flavourful finish.' },
];

export const CATEGORIES = [
  { id: 'wine',      label: 'Wine',           icon: '🍷', count: 4, desc: 'Red, White, Rosé & Sparkling' },
  { id: 'whisky',    label: 'Whisky',         icon: '🥃', count: 4, desc: 'Scotch, Bourbon & Irish' },
  { id: 'beer',      label: 'Beer',           icon: '🍺', count: 3, desc: 'Craft, Ales & Lagers' },
  { id: 'spirits',   label: 'Spirits',        icon: '🍸', count: 3, desc: 'Gin, Vodka & Tequila' },
  { id: 'groceries', label: 'Groceries',      icon: '🛒', count: 4, desc: 'Fresh & Everyday Essentials' },
];


export const REVIEWS = [
  { id: 1, name: 'James H.', location: 'Chelsea', rating: 5, text: 'Absolutely brilliant service. Ordered at 6pm and had my Macallan in under an hour. The best liquor delivery in London, hands down.', date: '2 days ago', avatar: 'JH' },
  { id: 2, name: 'Sophie C.', location: 'Mayfair', rating: 5, text: "The wine selection is superb and the packaging is impeccable. My Château Margaux arrived perfectly chilled. Truly premium.", date: '1 week ago', avatar: 'SC' },
  { id: 3, name: 'Omar A.', location: 'Shoreditch', rating: 4, text: 'Fast delivery and great prices. The groceries are top quality too. I use it weekly now for my household essentials.', date: '2 weeks ago', avatar: 'OA' },
  { id: 4, name: 'Priya M.', location: 'Canary Wharf', rating: 5, text: 'Hosted a dinner party and needed champagne last minute. Belgravia came through in 45 minutes. Lifesaver!', date: '3 weeks ago', avatar: 'PM' },
];
