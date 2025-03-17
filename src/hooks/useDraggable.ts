import { useState } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (initialPosition: Position) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);

  const handleMouseDown = (e: React.MouseEvent) => {
    // ... existing mouse down logic ...
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // ... existing touch start logic ...
  };

  const mergeDragStyles = (existingStyles?: React.CSSProperties): React.CSSProperties => {
    const dragStyles: React.CSSProperties = {
      WebkitUserSelect: 'none',
      userSelect: 'none',
      touchAction: 'none',
      cursor: 'move'
    };

    return existingStyles 
      ? { ...existingStyles, ...dragStyles } 
      : dragStyles;
  };

  return {
    isDragging,
    position,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      mergeDragStyles
    }
  };
};