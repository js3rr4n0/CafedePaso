'use client';

import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Coffee, ShoppingCart, Package, ClipboardList, Download, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SalesModule from '@/components/SalesModule';
import ProductsModule from '@/components/ProductsModule';
import ClosuresModule from '@/components/ClosuresModule';
import ExportModule from '@/components/ExportModule';
import HelpGuide from '@/components/HelpGuide';

const theme = createTheme({
  palette: {
    primary: { main: '#6B4423' },
    secondary: { main: '#D4A574' },
    background: { default: '#FBF6EE' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    fontSize: 16,
    button: { textTransform: 'none', fontSize: '1.1rem', fontWeight: 600 },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1.2rem',
          minHeight: 76,
          padding: '12px 16px',
          textTransform: 'none',
          fontWeight: 600,
          color: '#8D6E63',
          '&.Mui-selected': { color: '#3E2723' },
        },
      },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
  },
});

const tabsConfig = [
  { icon: ShoppingCart, label: 'Ventas', color: '#2E7D32' },
  { icon: Package, label: 'Productos', color: '#1565C0' },
  { icon: ClipboardList, label: 'Cierres', color: '#6A1B9A' },
  { icon: Download, label: 'Exportar', color: '#E65100' },
];

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  
  if (!now) return null;
  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2.5">
      <Clock className="w-6 h-6 text-amber-700" />
      <div>
        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#3E2723', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#8D6E63', textTransform: 'capitalize' }}>{date}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FBF6EE 0%, #FFE8CC 50%, #FFD8B0 100%)' }}>
        {/* Floating decorative blobs */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 380, height: 380, background: 'radial-gradient(circle, rgba(212,165,116,0.35) 0%, transparent 70%)', top: -120, right: -80, filter: 'blur(8px)' }}
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 460, height: 460, background: 'radial-gradient(circle, rgba(107,68,35,0.18) 0%, transparent 70%)', bottom: -160, left: -120, filter: 'blur(10px)' }}
          animate={{ y: [0, -25, 0], x: [0, 25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto p-4 md:p-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-5 md:p-6 mb-6 border border-amber-200"
            style={{ boxShadow: '0 10px 40px rgba(107,68,35,0.12)' }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="p-3.5 rounded-2xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6B4423 0%, #8D5A2B 100%)' }}
                >
                  <Coffee className="w-11 h-11 text-white" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, color: '#3E2723', letterSpacing: '-0.5px' }}>
                      Café de Paso
                    </h1>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      ● EN LÍNEA
                    </span>
                  </div>
                  <p style={{ fontSize: '1.1rem', margin: 0, color: '#8D6E63', fontWeight: 500 }}>
                    Sistema de Punto de Venta
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <LiveClock />
                <HelpGuide />
              </div>
            </div>
          </motion.div>

          {/* Welcome banner */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-amber-600 text-white rounded-full w-11 h-11 flex items-center justify-center flex-shrink-0 shadow-md"
              style={{ fontSize: '1.5rem', fontWeight: 700 }}
            >
              ?
            </motion.div>
            <p style={{ fontSize: '1.1rem', color: '#5D4037', margin: 0, lineHeight: 1.4 }}>
              ¿Primera vez usando el sistema? Toque el botón verde <strong>"¿Cómo usar el sistema?"</strong> arriba para ver una guía paso a paso.
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -4px 20px rgba(107,68,35,0.06)',
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 5,
                    backgroundColor: tabsConfig[currentTab].color,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                }}
              >
                {tabsConfig.map(({ icon: Icon, label, color }, i) => (
                  <Tab
                    key={label}
                    label={
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: currentTab === i ? color : '#F5EDE0',
                            color: currentTab === i ? 'white' : '#8D6E63',
                            transition: 'all 0.3s',
                            boxShadow: currentTab === i ? `0 4px 12px ${color}55` : 'none',
                          }}
                        >
                          <Icon size={22} />
                        </Box>
                        <span>{label}</span>
                      </motion.div>
                    }
                  />
                ))}
              </Tabs>
            </Box>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="bg-white rounded-b-3xl shadow-xl p-6 md:p-8"
            style={{ fontSize: '1.1rem', boxShadow: '0 10px 40px rgba(107,68,35,0.1)', minHeight: 500 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {currentTab === 0 && <SalesModule />}
                {currentTab === 1 && <ProductsModule />}
                {currentTab === 2 && <ClosuresModule />}
                {currentTab === 3 && <ExportModule />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-6 mb-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <p style={{ fontSize: '0.95rem', color: '#8D6E63', margin: 0 }}>
              Sincronizado con base de datos en la nube (Neon PostgreSQL)
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
