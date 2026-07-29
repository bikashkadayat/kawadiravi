/**
 * The site's primary navigation, defined once.
 *
 * Header and MobileNav both read this, so a route is added or reordered in a
 * single place. `labelKey` indexes into the `nav` namespace of the message
 * files — the label itself is never hard-coded, so both locales stay in sync.
 */

export interface NavItem {
  /** Locale-agnostic path; the next-intl <Link> adds the /en or /ne prefix. */
  href: string;
  /** Key under the `nav` namespace in messages/{en,ne}.json. */
  labelKey:
    | 'home'
    | 'rates'
    | 'calculator'
    | 'services'
    | 'about'
    | 'contact';
}

export const navItems: NavItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/rates', labelKey: 'rates' },
  { href: '/calculator', labelKey: 'calculator' },
  { href: '/services', labelKey: 'services' },
  { href: '/about', labelKey: 'about' },
  { href: '/contact', labelKey: 'contact' },
];

/**
 * Whether a nav link should render as the current page.
 *
 * `pathname` here is already locale-stripped by next-intl's usePathname, so it
 * is compared against the bare hrefs above. '/' must match exactly, otherwise
 * it would light up on every route.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
