import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: '/admin' });
  }, [navigate]);

  return null;
}
