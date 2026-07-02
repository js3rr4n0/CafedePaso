'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  const res = await query(`
    SELECT p.id, p.nombre as name, p.precio as price, c.nombre as category, p.activo as active
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.id ASC
  `);
  // Map category names to the UI expected names (or let UI adapt)
  const categoryMap: any = {
    'bebida': 'Bebidas Calientes', // Simplified mapping for the UI
    'comida': 'Comidas',
    'otro': 'Extras'
  };
  return res.rows.map(r => ({
    ...r,
    id: String(r.id),
    price: Number(r.price),
    category: categoryMap[r.category] || 'Bebidas Calientes',
    active: r.active
  }));
}

export async function saveProduct(product: any) {
  // Map UI category to DB category
  const reverseCategoryMap: any = {
    'Bebidas Calientes': 1, // bebida
    'Bebidas Frías': 1,     // bebida
    'Comidas': 2,           // comida
    'Extras': 3             // otro
  };
  const catId = reverseCategoryMap[product.category] || 1;

  if (product.id && !product.id.startsWith('new_')) {
    await query(`
      UPDATE productos 
      SET nombre = $1, precio = $2, categoria_id = $3
      WHERE id = $4
    `, [product.name, product.price, catId, product.id]);
  } else {
    await query(`
      INSERT INTO productos (nombre, precio, categoria_id, activo)
      VALUES ($1, $2, $3, $4)
    `, [product.name, product.price, catId, true]);
  }
  revalidatePath('/');
  return { success: true };
}

export async function toggleProductState(id: string, active: boolean) {
  await query(`UPDATE productos SET activo = $1 WHERE id = $2`, [active, id]);
  revalidatePath('/');
  return { success: true };
}

export async function deleteProduct(id: string) {
  try {
    await query(`DELETE FROM productos WHERE id = $1`, [id]);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    if (e.code === '23503') { // Foreign key violation error code in PostgreSQL
      return { success: false, error: 'No se puede borrar el producto porque ya tiene ventas asociadas. Por favor, desactívalo en su lugar.' };
    }
    return { success: false, error: 'Error al intentar eliminar el producto.' };
  }
}

export async function saveSale(cart: any[], total: number, paymentMethod: string) {
  // metodos_pago: 1=efectivo, 2=tarjeta, 3=transferencia
  const pmMap: any = { 'efectivo': 1, 'tarjeta': 2, 'transferencia': 3 };
  const pmId = pmMap[paymentMethod] || 1;

  // Transaction
  const { rows } = await query(`
    INSERT INTO ventas (total, metodo_pago_id)
    VALUES ($1, $2) RETURNING id
  `, [total, pmId]);
  
  const saleId = rows[0].id;

  for (const item of cart) {
    await query(`
      INSERT INTO venta_items (venta_id, producto_id, nombre_producto, precio_unitario, cantidad)
      VALUES ($1, $2, $3, $4, $5)
    `, [saleId, parseInt(item.product.id), item.product.name, item.product.price, item.quantity]);
    
    // Update notes if there are comments (we'll just append it to sale notes or we could add a column to venta_items, 
    // but standard schema doesn't have comments in venta_items, wait let me check: 
    // venta_items has (id, venta_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal).
    // The user asked "añade opcion de comntarios, por si el cliente pidio expresso o algun tipo especial de cafe!". 
    // The DB schema doesn't have it on venta_items. I will just append it to the venta.notas for now.
    if (item.comments) {
      await query(`
        UPDATE ventas SET notas = CONCAT(notas, CHR(10), $1::text) WHERE id = $2
      `, [`${item.product.name}: ${item.comments}`, saleId]);
    }
  }

  revalidatePath('/');
  return { success: true, saleId };
}

export async function getClosures() {
  const res = await query(`
    SELECT id, tipo as type, fecha_inicio as date, fecha_fin, total_ventas as "totalSales", num_transacciones as "salesCount",
           desglose_efectivo as "cash", desglose_tarjeta as "card", desglose_transfer as "transfer"
    FROM cierres
    ORDER BY fecha_inicio DESC
  `);
  return res.rows.map(r => ({
    id: String(r.id),
    date: r.date,
    type: (r.type === 'dia' ? 'daily' : r.type === 'semana' ? 'weekly' : 'monthly') as 'daily' | 'weekly' | 'monthly',
    totalSales: Number(r.totalSales),
    salesCount: Number(r.salesCount),
    paymentMethods: {
      efectivo: Number(r.cash),
      tarjeta: Number(r.card),
      transferencia: Number(r.transfer)
    },
    topProducts: [] // We don't have this in the cierres table, could fetch from sales if needed but maybe leave empty
  }));
}

export async function createClosure(type: 'daily' | 'weekly' | 'monthly') {
  const typeMap = { 'daily': 'dia', 'weekly': 'semana', 'monthly': 'mes' };
  const dbType = typeMap[type];
  
  let fromDate = new Date();
  if (type === 'weekly') {
    fromDate.setDate(fromDate.getDate() - fromDate.getDay());
  } else if (type === 'monthly') {
    fromDate.setDate(1);
  }
  
  // Call DB function
  // SELECT generar_cierre('dia', CURRENT_DATE, CURRENT_DATE);
  let q = `SELECT generar_cierre($1, $2, CURRENT_DATE)`;
  await query(q, [dbType, fromDate.toISOString().split('T')[0]]);

  revalidatePath('/');
  return { success: true };
}

export async function deleteClosure(id: string) {
  try {
    await query(`DELETE FROM cierres WHERE id = $1`, [id]);
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al intentar eliminar el cierre.' };
  }
}

export async function getSalesData(startDate: string, endDate: string) {
  // Fetch detailed sales
  const res = await query(`
    SELECT v.id, v.fecha_hora as date, v.total, mp.nombre as "paymentMethod", v.notas as comments,
           json_agg(json_build_object('product', json_build_object('name', vi.nombre_producto, 'price', vi.precio_unitario), 'quantity', vi.cantidad)) as items
    FROM ventas v
    JOIN metodos_pago mp ON v.metodo_pago_id = mp.id
    JOIN venta_items vi ON vi.venta_id = v.id
    WHERE v.fecha_hora >= $1::timestamp AND v.fecha_hora <= $2::timestamp + interval '1 day'
    AND v.anulada = FALSE
    GROUP BY v.id, mp.nombre
    ORDER BY v.fecha_hora DESC
  `, [startDate, endDate]);
  
  return res.rows.map(r => ({
    ...r,
    id: String(r.id),
    total: Number(r.total),
    items: r.items.map((i:any) => ({...i, comments: r.comments || ''})) // Simplification
  }));
}

export async function getProductSalesData(startDate: string, endDate: string) {
  const res = await query(`
    SELECT vi.nombre_producto as name, SUM(vi.cantidad) as quantity, SUM(vi.subtotal) as total
    FROM venta_items vi
    JOIN ventas v ON v.id = vi.venta_id
    WHERE v.fecha_hora >= $1::timestamp AND v.fecha_hora <= $2::timestamp + interval '1 day'
    AND v.anulada = FALSE
    GROUP BY vi.nombre_producto
    ORDER BY total DESC
  `, [startDate, endDate]);
  
  return res.rows.map(r => ({
    name: r.name,
    quantity: Number(r.quantity),
    total: Number(r.total)
  }));
}

export async function getPeriodicTotals() {
  const res = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN date_trunc('week', fecha_hora) = date_trunc('week', CURRENT_DATE) THEN total ELSE 0 END), 0) as this_week,
      COALESCE(SUM(CASE WHEN date_trunc('month', fecha_hora) = date_trunc('month', CURRENT_DATE) THEN total ELSE 0 END), 0) as this_month
    FROM ventas
    WHERE anulada = FALSE
  `);
  
  return {
    thisWeek: Number(res.rows[0].this_week),
    thisMonth: Number(res.rows[0].this_month)
  };
}

export async function getDailyAggregatedSales(startDate: string, endDate: string) {
  const res = await query(`
    WITH daily_sales AS (
      SELECT 
        v.fecha_hora::date as date,
        COUNT(v.id) as num_transactions,
        SUM(v.total) as total_sales,
        SUM(CASE WHEN mp.nombre = 'efectivo' THEN v.total ELSE 0 END) as total_cash,
        SUM(CASE WHEN mp.nombre = 'tarjeta' THEN v.total ELSE 0 END) as total_card,
        SUM(CASE WHEN mp.nombre = 'transferencia' THEN v.total ELSE 0 END) as total_transfer
      FROM ventas v
      JOIN metodos_pago mp ON v.metodo_pago_id = mp.id
      WHERE v.fecha_hora >= $1::timestamp AND v.fecha_hora <= $2::timestamp + interval '1 day'
      AND v.anulada = FALSE
      GROUP BY v.fecha_hora::date
    ),
    daily_items AS (
      SELECT 
        v.fecha_hora::date as date,
        vi.nombre_producto as name,
        SUM(vi.cantidad) as quantity,
        SUM(vi.subtotal) as subtotal
      FROM venta_items vi
      JOIN ventas v ON v.id = vi.venta_id
      WHERE v.fecha_hora >= $1::timestamp AND v.fecha_hora <= $2::timestamp + interval '1 day'
      AND v.anulada = FALSE
      GROUP BY v.fecha_hora::date, vi.nombre_producto
    )
    SELECT 
      ds.date,
      ds.num_transactions,
      ds.total_sales,
      ds.total_cash,
      ds.total_card,
      ds.total_transfer,
      (
        SELECT json_agg(json_build_object('name', di.name, 'quantity', di.quantity, 'total', di.subtotal))
        FROM daily_items di
        WHERE di.date = ds.date
      ) as items
    FROM daily_sales ds
    ORDER BY ds.date DESC;
  `, [startDate, endDate]);

  return res.rows.map(r => ({
    date: String(r.date),
    numTransactions: Number(r.num_transactions),
    totalSales: Number(r.total_sales),
    cash: Number(r.total_cash),
    card: Number(r.total_card),
    transfer: Number(r.total_transfer),
    items: r.items ? r.items.sort((a: any, b: any) => b.total - a.total) : []
  }));
}
