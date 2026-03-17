
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Mengarahkan pengguna langsung ke dashboard saat mengakses root URL
  redirect('/dashboard');
}
