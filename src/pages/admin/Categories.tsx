import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase, Category, isSupabaseConfigured } from '../../lib/supabase';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase!
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      if (error instanceof Error) {
        alert(`Erro ao buscar categorias: ${error.message}`);
      } else {
        alert('Erro ao buscar categorias: Verifique sua conexão com o Supabase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured()) {
      alert('Supabase não está configurado. Verifique as variáveis de ambiente.');
      return;
    }

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
      };
      if (editingCategory) {
        const { error } = await supabase!
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase!
          .from('categories')
          .insert(categoryData);
        if (error) throw error;
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image_url: '' });
      fetchCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      if (error instanceof Error) {
        alert(`Erro ao salvar categoria: ${error.message}`);
      } else {
        alert('Erro ao salvar categoria: Tente novamente.');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      if (!isSupabaseConfigured()) {
        alert('Supabase não está configurado. Verifique as variáveis de ambiente.');
        return;
      }

      try {
        const { error } = await supabase!
          .from('categories')
          .delete()
          .eq('id', categoryId);
        if (error) throw error;
        fetchCategories();
        alert('Categoria excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        if (error instanceof Error) {
          alert(`Erro ao excluir categoria: ${error.message}`);
        } else {
          alert('Erro ao excluir categoria: Tente novamente.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Preview dinâmico da imagem
  const imagePreview = formData.image_url ? (
    <img src={formData.image_url} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto mb-2" />
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-2">Organize seus produtos em categorias</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Adicionar Categoria</span>
        </button>
      </div>

      <div className="modern-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingCategory(null);
              setFormData({ name: '', description: '', image_url: '' });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="inline-block mr-2" /> Nova Categoria
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="modern-card p-4 flex flex-col items-center">
              {category.image_url && (
                <img src={category.image_url} alt={category.name} className="w-24 h-24 rounded-full object-cover mb-2" />
              )}
              <span className="text-lg font-semibold mb-1">{category.name}</span>
              <div className="mb-2 text-gray-600 text-sm">{category.description}</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="modern-card p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex flex-col items-center">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto mb-2" />
                  )}
                  <label className="block text-gray-700 font-semibold mb-2">URL da Imagem</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Cole a URL da imagem da categoria"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Nome</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Descrição</label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                      setFormData({ name: '', description: '', image_url: '' });
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCategory ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};