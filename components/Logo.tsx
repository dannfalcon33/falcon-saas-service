import React from 'react';
import Image from 'next/image';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <Image
    src="/icon.png"
    alt="Falcon IT Logo"
    width={48}
    height={48}
    className={`object-contain drop-shadow-[0_0_15px_rgba(47,93,140,0.5)] ${className}`}
  />
);
