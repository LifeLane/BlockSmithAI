
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the Core Console, which is the main feature page now.
  redirect('/core');
}

    