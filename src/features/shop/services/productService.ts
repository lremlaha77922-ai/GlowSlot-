import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { mockProducts } from '../../../data/mockProducts';
import { Product, ProductCategory } from '../../../types';

export const productService = {
  async list(category?: 'All' | ProductCategory): Promise<Product[]> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        let dbQuery = supabase.from('products').select('*');

        if (category && category !== 'All') {
          dbQuery = dbQuery.eq('category', category);
        }

        const { data, error } = await dbQuery;

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            brand: row.brand,
            category: row.category as ProductCategory,
            price: Number(row.price),
            originalPrice: row.original_price ? Number(row.original_price) : undefined,
            rating: Number(row.rating) || 4.7,
            reviewCount: Number(row.review_count) || 85,
            images: row.images || [],
            description: row.description || '',
            features: row.highlights || row.features || ['Premium quality salon grade'],
            inStock: row.in_stock ?? true,
          }));
        }
      } catch {
        // fallback
      }
    }

    if (!category || category === 'All') {
      return mockProducts;
    }
    return mockProducts.filter((p) => p.category === category);
  },

  async getById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            brand: data.brand,
            category: data.category as ProductCategory,
            price: Number(data.price),
            originalPrice: data.original_price ? Number(data.original_price) : undefined,
            rating: Number(data.rating),
            reviewCount: Number(data.review_count),
            images: data.images,
            description: data.description,
            features: data.highlights || data.features || [],
            inStock: data.in_stock,
          };
        }
      } catch {
        // fallback
      }
    }

    const found = mockProducts.find((p) => p.id === id);
    return found || mockProducts[0];
  },
};
