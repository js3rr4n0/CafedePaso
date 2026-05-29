'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getSalesData, getProductSalesData, getClosures } from '@/app/actions';

export default function ExportModule() {
  const [exportType, setExportType] = useState<'sales' | 'products' | 'closures'>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSales = async () => {
    if (!startDate || !endDate) {
      toast.error('Por favor seleccione ambas fechas');
      return;
    }

    try {
      const sales = await getSalesData(startDate, endDate);
      
      if (sales.length === 0) {
        toast.error('No hay ventas en el rango seleccionado');
        return;
      }

      let csv = 'ID Venta,Fecha,Producto,Cantidad,Precio Unitario,Subtotal,Comentarios,Método de Pago,Total Venta\n';

      sales.forEach(sale => {
        const saleDate = new Date(sale.date).toLocaleString('es-ES');
        sale.items.forEach((item: any) => {
          csv += `"${sale.id}","${saleDate}","${item.product.name}",${item.quantity},${item.product.price.toFixed(2)},${(item.product.price * item.quantity).toFixed(2)},"${sale.comments || ''}","${sale.paymentMethod}",${sale.total.toFixed(2)}\n`;
        });
      });

      downloadCSV(csv, `ventas_${startDate}_${endDate}.csv`);
      toast.success('Archivo CSV descargado');
    } catch (e) {
      toast.error('Error al exportar ventas');
    }
  };

  const exportProducts = async () => {
    if (!startDate || !endDate) {
      toast.error('Por favor seleccione ambas fechas');
      return;
    }

    try {
      const productsData = await getProductSalesData(startDate, endDate);
      
      let csv = 'Producto,Cantidad Vendida,Total Ingresos\n';
      productsData.forEach(p => {
        csv += `"${p.name}",${p.quantity},${p.total.toFixed(2)}\n`;
      });

      downloadCSV(csv, `productos_vendidos_${startDate}_${endDate}.csv`);
      toast.success('Archivo CSV descargado');
    } catch (e) {
      toast.error('Error al exportar productos');
    }
  };

  const exportClosures = async () => {
    try {
      const closures = await getClosures();

      if (closures.length === 0) {
        toast.error('No hay cierres registrados');
        return;
      }

      let csv = 'ID,Fecha,Tipo,Total Ventas,Cantidad Ventas,Efectivo,Tarjeta,Transferencia\n';

      closures.forEach(closure => {
        const date = new Date(closure.date).toLocaleDateString('es-ES');
        const type = closure.type === 'daily' ? 'Diario' : closure.type === 'weekly' ? 'Semanal' : 'Mensual';
        
        csv += `"${closure.id}","${date}","${type}",${closure.totalSales.toFixed(2)},${closure.salesCount},${(closure.paymentMethods.efectivo || 0).toFixed(2)},${(closure.paymentMethods.tarjeta || 0).toFixed(2)},${(closure.paymentMethods.transferencia || 0).toFixed(2)}\n`;
      });

      downloadCSV(csv, `cierres_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Archivo CSV descargado');
    } catch (e) {
      toast.error('Error al exportar cierres');
    }
  };

  const handleExport = () => {
    switch (exportType) {
      case 'sales':
        exportSales();
        break;
      case 'products':
        exportProducts();
        break;
      case 'closures':
        exportClosures();
        break;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Exportar Datos</h2>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <div className="space-y-4 mt-2">
                <FormControl fullWidth>
                  <InputLabel>Tipo de Exportación</InputLabel>
                  <Select
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value as any)}
                    label="Tipo de Exportación"
                  >
                    <MenuItem key="sales" value="sales">Ventas Detalladas</MenuItem>
                    <MenuItem key="products" value="products">Productos Vendidos</MenuItem>
                    <MenuItem key="closures" value="closures">Resumen de Cierres</MenuItem>
                  </Select>
                </FormControl>

                {exportType !== 'closures' && (
                  <>
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
                  </>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Download />}
                  onClick={handleExport}
                >
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="bg-blue-50">
            <CardContent>
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <Typography variant="h6" className="mb-2">
                    Información sobre Exportaciones
                  </Typography>
                  <Typography variant="body2" className="mb-2">
                    <strong>Ventas Detalladas:</strong> Exporta todas las ventas con detalle de productos, cantidades, comentarios y métodos de pago.
                  </Typography>
                  <Typography variant="body2" className="mb-2">
                    <strong>Productos Vendidos:</strong> Resumen agregado de productos vendidos con cantidades totales e ingresos.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Resumen de Cierres:</strong> Exporta todos los cierres registrados (diarios, semanales y mensuales).
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
