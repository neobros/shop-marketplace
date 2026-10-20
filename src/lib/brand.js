/** Marketplace identity & settings — change the name/contact details here. */
export const BRAND = {
  name: 'Handmade in Sri Lanka',
  short: 'Handmade',
  sub: 'in Sri Lanka',
  tagline: 'An online marketplace to buy and sell authentic Sri Lankan handmade products.',
  email: 'hello@handmade.lk',
  phone: '+94 77 123 4567',
  whatsapp: '+94 77 123 4567',
  address: 'No. 25, Flower Road, Colombo 07',
  bank: { name: 'Bank of Ceylon', account: '0012 3456 7890', holder: 'Handmade in Sri Lanka (Pvt) Ltd', branch: 'Colombo 07' },
};

// Keep in sync with shop-marketplace-backend/src/config/shop.js
export const FREE_SHIPPING_OVER = 15000;
export const SHIPPING_FLAT = 450;
export const COMMISSION_RATE = 0.1;

export const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara',
  'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export const PAYMENT_LABELS = { cod: 'Cash on delivery', bank: 'Bank transfer' };
