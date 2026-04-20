import React from 'react';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, size = 16, className = "" }) => {
  if (!name) return null;
  
  // Convert basic string like 'building' to 'Building' to match Lucide export names
  const fallbackNames = {
    'folder': 'Folder',
    'file': 'FileText',
    'calculator': 'Calculator',
    'home': 'Home',
    'building': 'Building',
    'door': 'DoorOpen',
    'layers': 'Layers',
    'hard-hat': 'HardHat',
    'hammer': 'Hammer',
    'ruler': 'Ruler'
  };

  let iconName = fallbackNames[name.toLowerCase()] || name;
  
  // Ensure PascalCase
  iconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());

  const IconComponent = LucideIcons[iconName];

  if (!IconComponent) {
    const Fallback = LucideIcons['Box'];
    return <Fallback size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} />;
};

export default DynamicIcon;
