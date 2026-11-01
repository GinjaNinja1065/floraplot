import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 border border-amber-400 px-3 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-sm animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode active — survey tallies are fully functional</span>
    </div>
  );
};
