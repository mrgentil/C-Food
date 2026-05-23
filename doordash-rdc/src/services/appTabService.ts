import api from './api';
import { getCached, setCached } from '../utils/storageCache';

export interface AppTab {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_home_tab: boolean;
}

interface AppTabsResponse {
  tabs: AppTab[];
}

const CACHE_KEY = 'cache:app_tabs_v3';
const TTL_MS = 5 * 60 * 1000;

export const appTabService = {
  async listPublished(): Promise<AppTab[]> {
    const cached = await getCached<AppTab[]>(CACHE_KEY, TTL_MS);
    if (cached?.length) {
      api.get<AppTabsResponse>('/app-tabs').then((r) => setCached(CACHE_KEY, r.data.tabs)).catch(() => null);
      return cached;
    }

    const response = await api.get<AppTabsResponse>('/app-tabs');
    const tabs = Array.isArray(response.data.tabs) ? response.data.tabs : [];
    await setCached(CACHE_KEY, tabs);
    return tabs;
  },
};
