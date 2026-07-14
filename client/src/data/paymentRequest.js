export const paymentRequest = {
  merchant: 'IndiGo',
  category: 'travel',
  wallet: 'Travel Wallet',
  amount: 15000,
  purpose: 'Flight booking from Chennai to Bangalore for a business trip, including a checked-baggage add-on.',
  requestedTime: '2 mins ago',
  aiConfidence: 96,
  confidenceLevel: 'High Confidence',
  riskLevel: 'High Risk',
  policyChecks: [
    {
      label: 'Merchant allow-list',
      passed: true,
      detail: 'IndiGo is a recognized travel merchant',
    },
    {
      label: 'Per-transaction limit',
      passed: false,
      detail: 'Exceeds the ₹3,000 per-transaction limit for Travel Wallet',
    },
    {
      label: 'Monthly budget',
      passed: true,
      detail: 'Within the remaining monthly travel budget',
    },
  ],
}
