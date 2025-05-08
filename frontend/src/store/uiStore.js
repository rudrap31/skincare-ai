import { create } from 'zustand';

export const useUIStore = create((set) => ({
    showTabs: true,
    setShowTabs: (value) => set({ showTabs: value }),
}));
