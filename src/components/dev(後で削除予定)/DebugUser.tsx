// components/DebugUser.tsx
'use client';
import { useUser } from '@clerk/nextjs';

export default function DebugUser() {
  const { user } = useUser();
  if (!user) return null;
  return <pre className="text-xs">UID: {user.id}</pre>;
}
