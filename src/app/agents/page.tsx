
import { redirect } from 'next/navigation';

export default function AgentsRedirectPage() {
  // This page's functionality has been replaced by the Vault page.
  // We redirect any old links to the new unified location.
  redirect('/vault');
}
