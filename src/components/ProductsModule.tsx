'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import { Plus, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getProducts, saveProduct, toggleProductState, deleteProduct } from '@/app/actions';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

export default function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Bebidas Calientes',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      toast.error('Error al cargar productos');
    }
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: 'Bebidas Calientes',
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0');
      return;
    }

    try {
      if (editingProduct) {
        await saveProduct({
          id: editingProduct.id,
          name: formData.name,
          price,
          category: formData.category
        });
        toast.success('Producto actualizado');
      } else {
        await saveProduct({
          name: formData.name,
          price,
          category: formData.category
        });
        toast.success('Producto agregado');
      }
      loadProducts();
      closeDialog();
    } catch (e) {
      toast.error('Error al guardar el producto');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleProductState(id, !currentActive);
      toast.info('Estado actualizado');
      loadProducts();
    } catch (e) {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success('Producto eliminado correctamente');
        loadProducts();
      } else {
        toast.error(res.error || 'Error al eliminar el producto');
      }
    } catch (e) {
      toast.error('Error al eliminar el producto');
    }
  };

  const categories = ['Bebidas Calientes', 'Bebidas Frías', 'Comidas', 'Extras'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => openDialog()}
        >
          Nuevo Producto
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Categoría</strong></TableCell>
              <TableCell><strong>Precio</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Chip label={product.category} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={product.active ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={product.active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => openDialog(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={product.active ? 'warning' : 'success'}
                    onClick={() => toggleActive(product.id, product.active)}
                    title={product.active ? "Desactivar" : "Activar"}
                  >
                    {product.active ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(product.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Nombre del Producto"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Categoría"
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Precio"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
