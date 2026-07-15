import { redirect } from 'next/navigation';
import { auth } from '../../auth';

export default async function OwnProfileRedirect() {
  const session = await auth();
  
  if (!session || !session.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/profile');
  }

  redirect(`/profile/${session.user.id}`);
}
