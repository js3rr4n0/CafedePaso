'use client';

import { useState } from 'react';
import { Dialog, DialogContent, Button, Box, IconButton } from '@mui/material';
import { HelpCircle, ShoppingCart, Package, ClipboardList, Download, X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const steps = [
  {
    icon: ShoppingCart,
    color: '#2E7D32',
    bg: '#E8F5E9',
    label: 'Hacer una Venta',
    short: 'Cobrar a un cliente',
    description: 'Toque la pestaña "Ventas". Elija productos tocando sus tarjetas — se agregan al carrito automáticamente. Ajuste la cantidad con los botones + y −.',
    tip: 'Si el cliente pide algo especial (por ejemplo "café expresso sin azúcar"), escríbalo en el campo de comentarios de ese producto.',
  },
  {
    icon: Package,
    color: '#1565C0',
    bg: '#E3F2FD',
    label: 'Administrar Productos',
    short: 'Cambiar precios o agregar nuevos',
    description: 'Toque "Productos" para agregar nuevos, editar precios o desactivar los que ya no vende. Elija la categoría correcta: Bebidas Calientes, Frías, Comidas o Extras.',
    tip: 'Desactivar un producto no lo borra — puede volver a activarlo cuando quiera.',
  },
  {
    icon: ClipboardList,
    color: '#6A1B9A',
    bg: '#F3E5F5',
    label: 'Ver los Cierres',
    short: 'Saber cuánto vendió',
    description: 'Toque "Cierres" para ver el total vendido hoy, esta semana o este mes. Verá también el historial de cierres anteriores con todos los detalles.',
    tip: 'Los cierres se calculan automáticamente. No necesita anotar nada a mano.',
  },
  {
    icon: Download,
    color: '#E65100',
    bg: '#FFF3E0',
    label: 'Exportar a Excel',
    short: 'Guardar sus reportes',
    description: 'Toque "Exportar" para descargar sus ventas como archivo. Elija el rango de fechas y el tipo de reporte: ventas, detalle de productos o resumen de cierres.',
    tip: 'El archivo CSV se abre con Excel o cualquier hoja de cálculo.',
  },
];

export default function HelpGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const handleOpen = () => { setStep(0); setOpen(true); };
  const current = steps[step];
  const Icon = current.icon;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(46,125,50,0.5)', '0 0 0 12px rgba(46,125,50,0)', '0 0 0 0 rgba(46,125,50,0)'] }}
        transition={{ boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeOut' } }}
        style={{ borderRadius: 14, display: 'inline-block' }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<HelpCircle size={28} />}
          onClick={handleOpen}
          sx={{
            backgroundColor: '#2E7D32',
            fontSize: '1.2rem',
            fontWeight: 600,
            padding: '14px 28px',
            textTransform: 'none',
            borderRadius: '14px',
            boxShadow: '0 6px 20px rgba(46,125,50,0.35)',
            '&:hover': { backgroundColor: '#1B5E20' },
          }}
        >
          ¿Cómo usar el sistema?
        </Button>
      </motion.div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFF8E7' } } }}
      >
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg, #6B4423 0%, #8D5A2B 100%)', color: 'white', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Sparkles size={28} />
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>Guía Paso a Paso</span>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <X size={28} />
          </IconButton>
        </Box>

        {/* Progress dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, padding: '20px 0 8px', backgroundColor: '#FFF8E7' }}>
          {steps.map((_, i) => (
            <motion.div
              key={i}
              onClick={() => setStep(i)}
              animate={{
                width: i === step ? 40 : 14,
                backgroundColor: i === step ? '#6B4423' : i < step ? '#D4A574' : '#E0CFB8',
              }}
              style={{ height: 14, borderRadius: 7, cursor: 'pointer' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          ))}
        </Box>

        <DialogContent sx={{ padding: '24px 32px 8px', backgroundColor: '#FFF8E7', minHeight: 380 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, marginBottom: 3 }}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  style={{ backgroundColor: current.color, color: 'white', borderRadius: 20, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${current.color}55` }}
                >
                  <Icon size={36} />
                </motion.div>
                <Box>
                  <div style={{ fontSize: '0.95rem', color: '#8D6E63', fontWeight: 600, letterSpacing: 1 }}>
                    PASO {step + 1} DE {steps.length}
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#3E2723', lineHeight: 1.1 }}>
                    {current.label}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: '#6D4C41', marginTop: 4 }}>
                    {current.short}
                  </div>
                </Box>
              </Box>

              <Box sx={{ backgroundColor: current.bg, borderRadius: 3, padding: 3, marginBottom: 2, borderLeft: `6px solid ${current.color}` }}>
                <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#3E2723', margin: 0 }}>
                  {current.description}
                </p>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', padding: 2, backgroundColor: '#FFF3D6', borderRadius: 2, border: '2px dashed #D4A574' }}>
                <CheckCircle2 size={26} color="#6B4423" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: '1.1rem', color: '#5D4037', margin: 0, lineHeight: 1.5 }}>
                  <strong>Consejo:</strong> {current.tip}
                </p>
              </Box>
            </motion.div>
          </AnimatePresence>
        </DialogContent>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '20px 28px 24px', backgroundColor: '#FFF8E7', gap: 2 }}>
          <Button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            variant="outlined"
            size="large"
            startIcon={<ChevronLeft size={24} />}
            sx={{ fontSize: '1.1rem', padding: '10px 20px', borderRadius: 3, borderWidth: 2, borderColor: '#6B4423', color: '#6B4423', '&:hover': { borderWidth: 2, backgroundColor: '#FFF3D6' } }}
          >
            Anterior
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              variant="contained"
              size="large"
              endIcon={<ChevronRight size={24} />}
              sx={{ fontSize: '1.15rem', padding: '10px 28px', borderRadius: 3, backgroundColor: '#6B4423', boxShadow: '0 4px 12px rgba(107,68,35,0.3)', '&:hover': { backgroundColor: '#5D3A1F' } }}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={() => setOpen(false)}
              variant="contained"
              size="large"
              startIcon={<CheckCircle2 size={24} />}
              sx={{ fontSize: '1.15rem', padding: '10px 28px', borderRadius: 3, backgroundColor: '#2E7D32', boxShadow: '0 4px 12px rgba(46,125,50,0.3)', '&:hover': { backgroundColor: '#1B5E20' } }}
            >
              ¡Entendido!
            </Button>
          )}
        </Box>
      </Dialog>
    </>
  );
}
