'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JoinNowButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/login');
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Join now
    </button>
  );
}