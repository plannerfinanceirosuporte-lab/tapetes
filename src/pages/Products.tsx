import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { supabase, Product, Category, isSupabaseConfigured } from '../lib/supabase';
import { mockProducts, mockCategories } from '../lib/mockData';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';

export const Products: React.FC = () => {
  const { settings } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using mock product data.');
      setProducts(mockProducts);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Using mock category data.');
      setCategories(mockCategories);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setCategories(mockCategories);
    }
  };

  const applyFilters = (productsToFilter: Product[]) => {
    let filtered = [...productsToFilter];

    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category_id === filters.category);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton w-32 h-32 rounded-full"></div>
      </div>
    );
  }

  const filteredProducts = applyFilters(products);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Página */}
      <div className="bg-white border-b border-gray-200">
        <div className="modern-container py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🛍️ Todos os Produtos</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encontre exatamente o que você está procurando em nossa coleção completa
            </p>
          </div>
        </div>
      </div>

      <div className="modern-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar com Filtros */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="filter-sidebar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="filter-title">🔍 Filtros</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn-secondary p-2"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Busca */}
                <div className="filter-group">
                  <label className="filter-label">Buscar Produtos</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="Digite o nome do produto..."
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div className="filter-group">
                  <label className="filter-label">Categoria</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Faixa de Preço */}
                <div className="filter-group">
                  <label className="filter-label">Faixa de Preço</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="Mín"
                      className="form-input"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="Máx"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Ordenação */}
                <div className="filter-group">
                  <label className="filter-label">Ordenar por</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="form-select"
                  >
                    <option value="newest">Mais Recentes</option>
                    <option value="price-low">Menor Preço</option>
                    <option value="price-high">Maior Preço</option>
                    <option value="name">Nome A-Z</option>
                  </select>
                </div>

                {/* Limpar Filtros */}
                <button
                  onClick={clearFilters}
                  className="btn-secondary w-full"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="flex-1">
            {/* Header da Lista */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-600">
                  {filters.category !== 'all' && categories.find(c => c.id === filters.category)?.name}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="modern-card text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {settings?.message_no_products_text || 'Nenhum produto encontrado'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os filtros para encontrar o que procura
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {filteredProducts.slice(0, Math.ceil(filteredProducts.length / 2)).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pt-2">
                  {filteredProducts.slice(Math.ceil(filteredProducts.length / 2)).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};