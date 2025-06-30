
import { redirect } from 'next/navigation';

export default function TerminalRedirectPage() {
  // This page is now the "Signals" page.
  redirect('/signals');
}

    