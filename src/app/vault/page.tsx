
'use client';

import { redirect } from 'next/navigation';

// This page's functionality has been replaced by the Premium Subscription page.
// We redirect any old links to the new unified location.
export default function VaultRedirectPage() {
  redirect('/premium');
}
