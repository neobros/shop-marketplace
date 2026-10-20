import {
  Amphora, BookOpen, Brush, Camera, Flower2, Footprints, Gem, Gift, Lamp, Leaf, Palette, Scissors,
  Shell, Shirt, Sofa, Sparkles, Tag, TreePalm, Watch,
} from 'lucide-react';

/** Icons selectable for categories in the admin panel (stored by name). */
export const CATEGORY_ICONS = {
  Tag, Lamp, Flower2, Shirt, Gem, Amphora, Brush, TreePalm, Palette, Leaf,
  Scissors, Shell, Sofa, Sparkles, Gift, Watch, Footprints, Camera, BookOpen,
};

export const categoryIcon = (name) => CATEGORY_ICONS[name] || Tag;
