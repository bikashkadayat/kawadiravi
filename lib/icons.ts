/**
 * Maps the kebab-case `icon` values in `data/rates.json` to lucide components.
 *
 * The mapping is explicit rather than a dynamic `import()` for three reasons:
 * only the icons actually used are bundled, there is no per-icon network
 * request or loading state, and an unknown name is caught at build time by
 * TypeScript instead of rendering a blank space in production.
 *
 * Adding a new icon to data/rates.json means adding one line here. If that is
 * forgotten, `resolveIcon` falls back to a neutral package glyph rather than
 * crashing the page.
 */

import {
  AirVent,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  Bell,
  BookOpen,
  Box,
  Cable,
  CircleDot,
  Container,
  Cpu,
  Fan,
  FileText,
  Hammer,
  Laptop,
  Layers,
  Milk,
  Monitor,
  Newspaper,
  Package,
  Pipette,
  Printer,
  Refrigerator,
  ShoppingBag,
  Smartphone,
  Square,
  Tv,
  TvMinimal,
  Unplug,
  Utensils,
  WashingMachine,
  Weight,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'air-vent': AirVent,
  battery: Battery,
  'battery-charging': BatteryCharging,
  'battery-full': BatteryFull,
  'battery-low': BatteryLow,
  bell: Bell,
  'book-open': BookOpen,
  box: Box,
  cable: Cable,
  'circle-dot': CircleDot,
  container: Container,
  cpu: Cpu,
  fan: Fan,
  'file-text': FileText,
  hammer: Hammer,
  laptop: Laptop,
  layers: Layers,
  milk: Milk,
  monitor: Monitor,
  newspaper: Newspaper,
  package: Package,
  pipette: Pipette,
  printer: Printer,
  refrigerator: Refrigerator,
  'shopping-bag': ShoppingBag,
  smartphone: Smartphone,
  square: Square,
  tv: Tv,
  'tv-minimal': TvMinimal,
  unplug: Unplug,
  utensils: Utensils,
  'washing-machine': WashingMachine,
  weight: Weight,
};

/** Icon for a `data/rates.json` icon name, falling back to a generic box. */
export function resolveIcon(name: string): LucideIcon {
  return iconMap[name] ?? Package;
}

/** One representative icon per rate category, for the "What we buy" grid. */
export const categoryIcons = {
  metals: Hammer,
  paper: Newspaper,
  plastic: Milk,
  battery: BatteryCharging,
  ewaste: Laptop,
} as const;
