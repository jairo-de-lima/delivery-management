import React from 'react';
import { Loader } from 'lucide-react';

export function Loading() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader className="w-6 h-6 animate-spin" />
      <span className="ml-2">Carregando...</span>
    </div>
  );
}