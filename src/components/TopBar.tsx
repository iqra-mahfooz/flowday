import React from 'react';
import { GitBranch, Terminal, Keyboard } from 'lucide-react';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  taskCount: number;
  completedCount: number;
}

export default function TopBar({ onOpenCommandPalette, taskCount, completedCount }: TopBarProps) {
  const isMac = navigator.platform.toLowerCase().includes('mac');
  const modKey = isMac ? '⌘' : 'Ctrl+';

  return (
    <div className="flex items-center justify-between px-4 h-10 bg-card border-b border-border flex-shrink-0">
      {/* Left: brand */}
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-primary" />
        <span className="mono text-sm font-bold text-primary">git</span>
        <span className="mono text-sm font-bold text-foreground">space</span>
        <span className="mono text-xs text-muted-foreground ml-2 opacity-50">
          {completedCount}/{taskCount} committed
        </span>
      </div>

      {/* Center: command palette trigger */}
      <button
        className="flex items-center gap-2 px-3 py-1 rounded-sm border border-border bg-muted/50 hover:bg-muted mono text-xs text-muted-foreground transition-colors"
        onClick={onOpenCommandPalette}
      >
        <Terminal className="w-3 h-3" />
        <span>Search or run command…</span>
        <kbd className="ml-2 px-1.5 py-0.5 border border-border rounded-sm text-xs">
          {modKey}K
        </kbd>
      </button>

      {/* Right: shortcuts hint */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-muted-foreground opacity-40">
          <Keyboard className="w-3 h-3" />
          <span className="mono text-xs">N new · {modKey}Enter commit · Space pan</span>
        </div>
      </div>
    </div>
  );
}
