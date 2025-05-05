"use client";

import { useState, useEffect, ReactNode } from 'react';
import { SocketProvider } from '../context/SocketContext';

interface ClientOnlyProps {
  children: ReactNode;
}

export default function ClientOnly({ children }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <SocketProvider>{children}</SocketProvider>;
} 