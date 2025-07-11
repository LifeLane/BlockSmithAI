
import { redirect } from 'next/navigation';

export default function MonitorPage() {
  // This page's functionality has been merged into the Portfolio page.
  // We redirect any old links to the new unified location.
  redirect('/pulse');
}

    
