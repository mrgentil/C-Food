import type { AppTab } from '../services/appTabService';
import type { CategoryTabItem } from '../components/CategorySwitcher';

/** IDs stables des onglets (API + navigation). */
const RESTAURANT_SLUG = 'restaurant';

export function mainCategoryTabsFallback(): CategoryTabItem[] {
  return [
    { id: RESTAURANT_SLUG, name: 'Restaurants', icon: 'restaurant-outline' },
    { id: 'grocery', name: 'Épicerie', icon: 'cart-outline' },
    { id: 'supermarket', name: 'Supermarché', icon: 'storefront-outline' },
    { id: 'alcohol', name: 'Alcool', icon: 'wine-outline' },
    { id: 'flowers', name: 'Fleurs', icon: 'flower-outline' },
    { id: 'pharmacy', name: 'Pharmacie', icon: 'medical-outline' },
    { id: 'pet', name: 'Animalerie', icon: 'paw-outline' },
  ];
}

const CANONICAL_ORDER = mainCategoryTabsFallback().map((t) => t.id);

/**
 * Combine les onglets publiés de l'API avec l'ordre canonique : si l'API ne renvoie
 * pas un slug (ex. supermarché si la prod n'est pas migrée), on le garde quand même.
 * Les onglets uniquement-admin restent à la fin.
 */
export function mergeAppTabsWithFallback(apiTabs: AppTab[]): CategoryTabItem[] {
  const bySlug = new Map(apiTabs.map((t) => [t.slug, t]));
  const result: CategoryTabItem[] = [];
  const used = new Set<string>();

  for (const slug of CANONICAL_ORDER) {
    const t = bySlug.get(slug);
    const fallback = mainCategoryTabsFallback().find((x) => x.id === slug);
    if (t) {
      result.push({
        id: t.slug,
        name: t.name,
        icon: t.icon || fallback?.icon || 'grid-outline',
      });
      used.add(slug);
    } else if (fallback) {
      result.push(fallback);
      used.add(slug);
    }
  }

  for (const t of apiTabs) {
    if (!used.has(t.slug)) {
      result.push({
        id: t.slug,
        name: t.name,
        icon: t.icon || 'grid-outline',
      });
      used.add(t.slug);
    }
  }

  return result;
}
