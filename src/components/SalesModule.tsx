'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { getProducts, saveSale } from '@/app/actions';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  comments: string;
}

export default function SalesModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null
  });
  const [tempComment, setTempComment] = useState('');

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

  const categories = ['all', 'Bebidas Calientes', 'Bebidas Frías', 'Comidas', 'Extras'];

  const filteredProducts = selectedCategory === 'all'
    ? products.filter(p => p.active)
    : products.filter(p => p.category === selectedCategory && p.active);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, comments: '' }]);
    }
    toast.success(`${product.name} agregado al carrito`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const openCommentDialog = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    setTempComment(item?.comments || '');
    setCommentDialog({ open: true, productId });
  };

  const saveComment = () => {
    if (commentDialog.productId) {
      setCart(cart.map(item =>
        item.product.id === commentDialog.productId
          ? { ...item, comments: tempComment }
          : item
      ));
    }
    setCommentDialog({ open: false, productId: null });
    setTempComment('');
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const clearCart = () => {
    setCart([]);
    toast.info('Carrito limpiado');
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    try {
      await saveSale(cart, total, paymentMethod);
      toast.success(`Venta completada: $${total.toFixed(2)}`);
      setCart([]);
      setPaymentMethod('efectivo');
    } catch (e) {
      toast.error('Error al procesar la venta');
    }
  };

  return (
    <div>
      <Grid container spacing={3}>
        {/* Products Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <div className="mb-4">
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Categoría"
              >
                <MenuItem key="all" value="all">Todas las Categorías</MenuItem>
                {categories.slice(1).map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <Grid container spacing={2}>
            {filteredProducts.map(product => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={product.id}>
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="text-center">
                    <Typography variant="h6" className="text-sm font-semibold mb-2">
                      {product.name}
                    </Typography>
                    <Chip
                      label={product.category}
                      size="small"
                      className="mb-2"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="h5" color="primary" className="font-bold">
                      ${product.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Cart Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="sticky top-4">
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-6 h-6" />
                <Typography variant="h5">Carrito</Typography>
              </div>

              {cart.length === 0 ? (
                <Typography color="textSecondary" className="text-center py-8">
                  El carrito está vacío
                </Typography>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <Typography variant="body1" className="font-semibold">
                              {item.product.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              ${item.product.price.toFixed(2)} c/u
                            </Typography>
                          </div>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </IconButton>
                          <Typography className="w-8 text-center font-semibold">
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </IconButton>
                          <Typography className="ml-auto font-semibold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </div>

                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => openCommentDialog(item.product.id)}
                        >
                          {item.comments ? '✓ Comentarios' : '+ Agregar Comentarios'}
                        </Button>
                        {item.comments && (
                          <Typography variant="caption" className="block mt-1 text-gray-600 italic">
                            "{item.comments}"
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <Typography variant="h5">Total:</Typography>
                      <Typography variant="h4" color="primary" className="font-bold">
                        ${total.toFixed(2)}
                      </Typography>
                    </div>

                    <FormControl fullWidth className="mb-3">
                      <InputLabel>Método de Pago</InputLabel>
                      <Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        label="Método de Pago"
                      >
                        <MenuItem key="efectivo" value="efectivo">Efectivo</MenuItem>
                        <MenuItem key="tarjeta" value="tarjeta">Tarjeta</MenuItem>
                        <MenuItem key="transferencia" value="transferencia">Transferencia</MenuItem>
                      </Select>
                    </FormControl>

                    <div className="flex gap-2">
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={clearCart}
                      >
                        Limpiar
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<CreditCard />}
                        onClick={completeSale}
                      >
                        Cobrar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comments Dialog */}
      <Dialog open={commentDialog.open} onClose={() => setCommentDialog({ open: false, productId: null })}>
        <DialogTitle>Comentarios Especiales</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Ej: Sin azúcar, doble shot, leche de almendra"
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
            placeholder="Agregar instrucciones especiales..."
            className="mt-2"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog({ open: false, productId: null })}>
            Cancelar
          </Button>
          <Button onClick={saveComment} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
