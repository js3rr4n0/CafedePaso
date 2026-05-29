'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  IconButton,
} from '@mui/material';
import { DollarSign, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getClosures, createClosure, deleteClosure } from '@/app/actions';

interface Closure {
  id: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  totalSales: number;
  salesCount: number;
  paymentMethods: Record<string, number>;
  topProducts: Array<{ name: string; quantity: number; total: number }>;
}

export default function ClosuresModule() {
  const [closures, setClosures] = useState<Closure[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    let keySequence = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      keySequence += e.key;
      if (keySequence.length > 6) {
        keySequence = keySequence.slice(-6);
      }
      if (keySequence === '123456') {
        setIsDevMode(prev => {
          const next = !prev;
          if (next) toast.success('Modo desarrollador activado (Eliminar cierres habilitado)');
          else toast.info('Modo desarrollador desactivado');
          return next;
        });
        keySequence = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    loadClosures();
  }, []);

  const loadClosures = async () => {
    try {
      const data = await getClosures();
      setClosures(data);
    } catch (e) {
      toast.error('Error al cargar cierres');
    }
  };

  const handleCreateClosure = async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      await createClosure(type);
      toast.success(`Cierre ${type === 'daily' ? 'diario' : type === 'weekly' ? 'semanal' : 'mensual'} creado`);
      loadClosures();
    } catch (e) {
      toast.error('Error al crear el cierre. Posiblemente no haya ventas en el período o ya se cerró.');
    }
  };

  const handleDeleteClosure = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cierre? Esto no afectará a las ventas en sí, solo borrará este registro de cierre.')) return;
    try {
      const res = await deleteClosure(id);
      if (res.success) {
        toast.success('Cierre eliminado correctamente');
        loadClosures();
      } else {
        toast.error(res.error || 'Error al eliminar el cierre');
      }
    } catch (e) {
      toast.error('Error al eliminar el cierre');
    }
  };

  const getClosuresByType = (type: 'daily' | 'weekly' | 'monthly') => {
    return closures.filter(c => c.type === type);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const ClosuresList = ({ type }: { type: 'daily' | 'weekly' | 'monthly' }) => {
    const typeClosures = getClosuresByType(type);

    return (
      <div>
        {typeClosures.length === 0 ? (
          <Typography color="textSecondary" className="text-center py-8">
            No hay cierres {type === 'daily' ? 'diarios' : type === 'weekly' ? 'semanales' : 'mensuales'} registrados
          </Typography>
        ) : (
          <div className="space-y-4">
            {typeClosures.map(closure => (
              <Card key={closure.id} variant="outlined">
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Typography variant="h6">
                          Cierre {type === 'daily' ? 'Diario' : type === 'weekly' ? 'Semanal' : 'Mensual'}
                        </Typography>
                        {isDevMode && (
                          <IconButton size="small" color="error" onClick={() => handleDeleteClosure(closure.id)} title="Borrar Cierre (Dev Mode)">
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        )}
                      </div>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(closure.date)}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="h4" color="primary">
                        ${closure.totalSales.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {closure.salesCount} ventas
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="subtitle2" className="mb-2">Métodos de Pago:</Typography>
                      {Object.entries(closure.paymentMethods).map(([method, amount]) => (
                        <div key={method} className="flex justify-between py-1">
                          <span className="capitalize">{method}:</span>
                          <span className="font-semibold">${(amount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {closure.topProducts && closure.topProducts.length > 0 && (
                      <div>
                        <Typography variant="subtitle2" className="mb-2">Productos Más Vendidos:</Typography>
                        <div className="space-y-1">
                          {closure.topProducts.slice(0, 5).map((product, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{product.name} ({product.quantity})</span>
                              <span className="font-semibold">${product.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Cierres de Caja</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="contained"
            fullWidth
            startIcon={<Calendar />}
            onClick={() => handleCreateClosure('daily')}
          >
            Cierre Diario
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<TrendingUp />}
            onClick={() => handleCreateClosure('weekly')}
            color="secondary"
          >
            Cierre Semanal
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<DollarSign />}
            onClick={() => handleCreateClosure('monthly')}
            color="success"
          >
            Cierre Mensual
          </Button>
        </div>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Diarios" />
          <Tab label="Semanales" />
          <Tab label="Mensuales" />
        </Tabs>
      </Box>

      {currentTab === 0 && <ClosuresList type="daily" />}
      {currentTab === 1 && <ClosuresList type="weekly" />}
      {currentTab === 2 && <ClosuresList type="monthly" />}
    </div>
  );
}
