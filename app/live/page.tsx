import { redirect } from 'next/navigation';

export default async function LivePage() {
  redirect('/?pane=create');
}
