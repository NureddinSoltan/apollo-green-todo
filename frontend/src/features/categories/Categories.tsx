import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Category } from '../../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';

interface CategoriesProps {
  onCategoryUpdated: () => void;
}

export default function Categories({ onCategoryUpdated }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Starting to fetch categories...');
      const data = await getCategories();

      console.log('📡 Raw API response:', data);
      console.log('📊 Response type:', typeof data);
      console.log('📋 Is array?', Array.isArray(data));
      console.log('🔢 Response length:', data?.length);
      console.log('📝 Response keys:', data ? Object.keys(data) : 'No data');

      // Ensure categories is always an array
      if (Array.isArray(data)) {
        console.log('✅ Data is array, setting categories');
        setCategories(data);
      } else {
        console.error('❌ Data is NOT an array:', data);
        console.error('❌ Data type:', typeof data);
        console.error('❌ Data structure:', JSON.stringify(data, null, 2));
        setCategories([]);
        setError(`Invalid categories data received from server. Expected array, got: ${typeof data}`);
      }
    } catch (err: any) {
      console.error('💥 Error loading categories:', err);
      console.error('💥 Error response:', err.response);
      console.error('💥 Error status:', err.response?.status);
      console.error('💥 Error data:', err.response?.data);
      setError(`Failed to load categories: ${err.message || 'Unknown error'}`);
      setCategories([]); // Set empty array as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      await createCategory(formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      loadCategories();
      onCategoryUpdated();
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError('Failed to create category. Please try again.');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    try {
      await updateCategory({
        id: editingCategory.id,
        ...formData
      });
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      loadCategories();
      onCategoryUpdated();
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(id);
      loadCategories();
      onCategoryUpdated();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3B82F6' });
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 max-w-md mx-auto">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadCategories}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categories</h2>
          <p className="text-muted-foreground">Manage your project categories</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!Array.isArray(categories) || categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No categories yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first category to organize your projects
                    </p>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      Create First Category
                    </Button>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="w-6 h-6 rounded-full border border-border"
                        style={{ backgroundColor: category.color }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {category.project_count || 0} projects
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add New Category</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-foreground mb-2">
                  Color *
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Edit Category</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleEditCategory(); }} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category name"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              <div>
                <label htmlFor="edit-color" className="block text-sm font-medium text-foreground mb-2">
                  Color *
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="edit-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
