
import { redirect } from 'next/navigation';

export default function MissionsRedirectPage() {
  // This page's functionality has been merged into the Profile page.
  // We redirect any old links to the new unified location.
  redirect('/profile');
}

    