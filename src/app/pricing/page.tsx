import { redirect } from 'next/navigation';

// Pricing redirects to subscription page
export default function PricingPage() {
  redirect('/subscription');
}
