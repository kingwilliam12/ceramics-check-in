"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

interface Props {
  children: React.ReactNode;
  requiredRole: string;
}

export default function RoleGuard({ children, requiredRole }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = data.session?.user.user_metadata.role;
      if (role === requiredRole || role === 'super-admin') {
        setAuthorized(true);
      } else {
        router.replace('/403');
      }
    });
  }, [router, requiredRole]);

  if (!authorized) return null;
  return <>{children}</>;
}
