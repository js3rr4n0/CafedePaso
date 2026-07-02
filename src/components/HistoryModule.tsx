'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Collapse,
  IconButton
} from '@mui/material';
import { Search, History, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { getDailyAggregatedSales, getPeriodicTotals } from '@/app/actions';

function Row({ sale }: { sale: any }) {
  const [open, setOpen] = useState(false);
  const [year, month, day] = sale.date.split('-');
  const localDate = new Date(Number(year), Number(month) - 1, Number(day));
  const dateStr = localDate.toLocaleDateString('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" className="font-medium capitalize">
          {dateStr}
        </TableCell>
        <TableCell>{sale.numTransactions}</TableCell>
        <TableCell>
          <div className="flex gap-2 flex-wrap">
            {sale.cash > 0 && <Chip label={`Efectivo: $${sale.cash.toFixed(2)}`} color="success" size="small" variant="outlined"/>}
            {sale.card > 0 && <Chip label={`Tarjeta: $${sale.card.toFixed(2)}`} color="info" size="small" variant="outlined"/>}
            {sale.transfer > 0 && <Chip label={`Transf: $${sale.transfer.toFixed(2)}`} color="warning" size="small" variant="outlined"/>}
          </div>
        </TableCell>
        <TableCell align="right" className="font-bold text-gray-700">
          ${sale.totalSales.toFixed(2)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, padding: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom component="div" className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                Productos Vendidos en el Día
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell className="text-xs text-gray-500">Producto</TableCell>
                    <TableCell align="right" className="text-xs text-gray-500">Cantidad Vendida</TableCell>
                    <TableCell align="right" className="text-xs text-gray-500">Ingreso Generado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row" className="font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right" className="font-bold text-gray-700">
                        ${item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function HistoryModule() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ thisWeek: 0, thisMonth: 0 });

  useEffect(() => {
    // Set default dates to today
    const today = new Date().toLocaleString('sv').split(' ')[0]; // Gets local YYYY-MM-DD
    setStartDate(today);
    setEndDate(today);
    fetchSales(today, today);
    
    // Fetch periodic totals
    getPeriodicTotals().then(setTotals).catch(console.error);
  }, []);

  const fetchSales = async (start: string, end: string) => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const data = await getDailyAggregatedSales(start, end);
      setSales(data);
    } catch (e) {
      toast.error('Error al cargar el historial de ventas');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      toast.error('Por favor seleccione ambas fechas');
      return;
    }
    fetchSales(startDate, endDate);
  };

  // Calculate totals
  const totalTransacciones = sales.reduce((sum, sale) => sum + sale.numTransactions, 0);
  const totalIngresos = sales.reduce((sum, sale) => sum + sale.totalSales, 0);
  const totalEfectivo = sales.reduce((sum, sale) => sum + sale.cash, 0);
  const totalTarjeta = sales.reduce((sum, sale) => sum + sale.card, 0);
  const totalTransferencia = sales.reduce((sum, sale) => sum + sale.transfer, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <History className="w-6 h-6 text-blue-600" /> Historial de Ventas
      </h2>

      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent>
              <Typography variant="h6" className="mb-4 text-gray-700">Filtro por Fechas</Typography>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Inicio"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={<Search />}
                  sx={{ height: '56px', minWidth: '140px', borderRadius: '12px' }}
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="h-full border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent>
              <Typography variant="h6" className="mb-3 text-amber-900">Resumen del Periodo</Typography>
              <div className="flex justify-between items-center mb-1">
                <Typography variant="body2" className="text-amber-800">Transacciones:</Typography>
                <Typography variant="body1" className="font-bold text-amber-900">{totalTransacciones}</Typography>
              </div>
              <div className="flex justify-between items-center mb-3">
                <Typography variant="body2" className="text-amber-800">Total Ingresos:</Typography>
                <Typography variant="h5" className="font-bold text-amber-700">${totalIngresos.toFixed(2)}</Typography>
              </div>
              
              <div className="pt-3 border-t border-amber-200 mt-2 text-sm text-amber-800 space-y-1">
                <div className="flex justify-between">
                  <span>Efectivo:</span> <span className="font-medium">${totalEfectivo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarjeta:</span> <span className="font-medium">${totalTarjeta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transferencia:</span> <span className="font-medium">${totalTransferencia.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} className="shadow-md rounded-xl overflow-hidden border border-gray-100 mb-6">
        <Table aria-label="collapsible table">
          <TableHead className="bg-gray-50 border-b border-gray-200">
            <TableRow>
              <TableCell />
              <TableCell className="font-bold text-gray-600">Fecha</TableCell>
              <TableCell className="font-bold text-gray-600">Transacciones</TableCell>
              <TableCell className="font-bold text-gray-600">Desglose de Ingresos</TableCell>
              <TableCell className="font-bold text-gray-600" align="right">Total del Día</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" className="py-12 text-gray-500">
                  {loading ? 'Cargando ventas...' : 'No se encontraron ventas en este periodo.'}
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <Row key={sale.date} sale={sale} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="border border-green-200 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent>
              <Typography variant="body2" className="text-green-800 font-medium mb-1">Total Semana Actual</Typography>
              <Typography variant="h4" className="font-bold text-green-700">${totals.thisWeek.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="border border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent>
              <Typography variant="body2" className="text-blue-800 font-medium mb-1">Total Mes Actual</Typography>
              <Typography variant="h4" className="font-bold text-blue-700">${totals.thisMonth.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
