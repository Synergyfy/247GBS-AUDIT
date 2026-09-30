import { API_BASE_URL } from "@/lib/api";
import { SECTORS } from "@/data/sectors";

export interface EcosystemSector {
  id: string;
  name: string;
  slug?: string;
}

export interface EcosystemCategory {
  id: string;
  sectorId: string;
  name: string;
  slug?: string;
}

export interface EcosystemSubcategory {
  id: string;
  categoryId: string;
  name: string;
  slug?: string;
}

/**
 * Fetches all available sectors from Central Hub Solution (via our backend ecosystem endpoint),
 * with seamless fallback to the local sectors catalog.
 */
export async function fetchEcosystemSectors(): Promise<EcosystemSector[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ecosystem/sectors`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug || s.id,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not load sectors from backend, using fallback catalog:", err);
  }

  // Fallback to local catalog
  return SECTORS.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.id,
  }));
}

/**
 * Fetches categories for a given sector from Central Hub Solution.
 */
export async function fetchEcosystemCategories(sectorId?: string): Promise<EcosystemCategory[]> {
  if (!sectorId) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/ecosystem/categories?sectorId=${encodeURIComponent(sectorId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          sectorId: c.sectorId || sectorId,
          name: c.name,
          slug: c.slug || c.id,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not load categories from backend, using fallback catalog:", err);
  }

  // Fallback to local catalog groups
  const localSector = SECTORS.find((s) => s.id === sectorId);
  if (!localSector) return [];

  return (localSector.groups || []).map((g) => ({
    id: g.id,
    sectorId,
    name: g.name,
    slug: g.id,
  }));
}

/**
 * Fetches subcategories for a given category from Central Hub Solution.
 */
export async function fetchEcosystemSubcategories(
  categoryId?: string,
  sectorId?: string
): Promise<EcosystemSubcategory[]> {
  if (!categoryId) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/ecosystem/subcategories?categoryId=${encodeURIComponent(categoryId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((sc: any) => ({
          id: sc.id,
          categoryId: sc.categoryId || categoryId,
          name: sc.name,
          slug: sc.slug || sc.id,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not load subcategories from backend, using fallback catalog:", err);
  }

  // Fallback to local catalog group types
  for (const s of SECTORS) {
    if (sectorId && s.id !== sectorId) continue;
    const group = (s.groups || []).find((g) => g.id === categoryId);
    if (group && Array.isArray(group.types)) {
      return group.types.map((t) => ({
        id: t.id,
        categoryId,
        name: t.name,
        slug: t.id,
      }));
    }
  }

  return [];
}
