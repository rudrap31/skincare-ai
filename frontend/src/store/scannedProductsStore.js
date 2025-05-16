import { create } from 'zustand';
import { supabase } from '../supabase/supabase';

export const useScannedProductsStore = create((set) => ({
  products: [],
  loading: false,

  fetchScannedProducts: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('scanned_products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch scanned products:', error.message);
      set({ loading: false });
      return;
    }

    set({ products: data || [], loading: false });
  },

  addProduct: (product) =>
    set((state) => ({
      products: [product, ...state.products],
    })),
}));
