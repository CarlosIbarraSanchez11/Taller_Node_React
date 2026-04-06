import jsPDF from 'jspdf';

export const generarCotizacionPDF = (orden) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 15;

    // --- COLORES ---
    const ROJO_DR = [220, 38, 38];
    const AZUL_ACCENTO = [37, 99, 235];
    const NEGRO = [15, 23, 42];
    const GRIS_TEXTO = [100, 116, 139];
    const VERDE_KIT = [34, 197, 94];

    // --- 1. HEADER Y BOX COTIZACIÓN ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...ROJO_DR);
    doc.text('Dr. MOTORS', 14, y + 5);
    
    doc.setDrawColor(0);
    doc.roundedRect(125, y - 5, 70, 25, 3, 3, 'D');
    doc.setFontSize(14);
    doc.setTextColor(...NEGRO);
    doc.text('COTIZACIÓN', 160, y + 2, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`N° COT-${orden.id?.slice(-6).toUpperCase()}`, 160, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 160, y + 14, { align: 'center' });

    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('RUC: 20512345678 | Lima, Perú | Tel: 999-999-999', 14, y);
    y += 10;

    // --- 2. DATOS CLIENTE / VEHÍCULO ---
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, W - 28, 18, 2, 2, 'F');
    doc.setFontSize(7);
    doc.text('Cliente', 20, y + 6);
    doc.text('Vehículo / Placa', W - 20, y + 6, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NEGRO);
    doc.text(`${orden.cita?.vehiculo?.cliente?.nombres} ${orden.cita?.vehiculo?.cliente?.apellidos}`, 20, y + 13);
    doc.text(`${orden.cita?.vehiculo?.marca} ${orden.cita?.vehiculo?.modelo} | ${orden.cita?.vehiculo?.placa}`, W - 20, y + 13, { align: 'right' });

    y += 28;

    // --- 3. TABLA AUTORIZADOS (INCLUYE KIT E INSTALADOS) ---
    doc.setFontSize(10);
    doc.setTextColor(...AZUL_ACCENTO);
    doc.text('SERVICIOS Y REPUESTOS AUTORIZADOS', 14, y);
    y += 2;
    doc.setDrawColor(...AZUL_ACCENTO);
    doc.setLineWidth(0.8);
    doc.line(14, y, 75, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(...NEGRO);
    doc.text('Cant.', 14, y);
    doc.text('Descripción del Servicio', 30, y);
    doc.text('P.Unit', 160, y, { align: 'right' });
    doc.text('Total', 195, y, { align: 'right' });
    
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.1);
    doc.line(14, y, 195, y);
    y += 7;

    let subtotal = 0;

    // A. SERVICIO BASE
    const precioServicio = Number(orden.cita?.servicio?.precioBase || 0);
    subtotal += precioServicio;
    doc.setFont('helvetica', 'normal');
    doc.text('1.00', 14, y);
    doc.text(orden.cita?.servicio?.especialidad?.toUpperCase() || 'SERVICIO', 30, y);
    doc.text(`S/ ${precioServicio.toFixed(2)}`, 160, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`S/ ${precioServicio.toFixed(2)}`, 195, y, { align: 'right' });
    y += 8;

    // B. HALLAZGOS AUTORIZADOS / INSTALADOS
    const autorizados = (orden.hallazgos || []).filter(h => 
        ['INSTALADO', 'RECIBIDO', 'APROBADO', 'ENTREGADO'].includes(h.estado)
    );

    autorizados.forEach(h => {
        const precio = Number(h.precioVenta || 0);
        const total = Number(h.total || 0);
        subtotal += total;

        doc.setFont('helvetica', 'normal');
        doc.text(Number(h.cantidad || 1).toFixed(2), 14, y);
        doc.text(h.puntoFalla.toUpperCase(), 30, y);
        
        if (precio === 0) {
            // Badge INCLUIDO EN KIT
            const txtW = doc.getTextWidth(h.puntoFalla.toUpperCase());
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(30 + txtW + 3, y - 3.5, 20, 4.5, 1, 1, 'F');
            doc.setFontSize(6);
            doc.setTextColor(...VERDE_KIT);
            doc.text('INCLUIDO EN KIT', 30 + txtW + 13, y - 0.5, { align: 'center' });
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('INCLUIDO', 160, y, { align: 'right' });
            doc.text('S/ 0.00', 195, y, { align: 'right' });
        } else {
            doc.setFontSize(9);
            doc.text(`S/ ${precio.toFixed(2)}`, 160, y, { align: 'right' });
            doc.setFont('helvetica', 'bold');
            doc.text(`S/ ${total.toFixed(2)}`, 195, y, { align: 'right' });
        }
        y += 8;
    });

    // --- 4. SECCIÓN PENDIENTES (RECHAZADOS) ---
    const pendientes = (orden.hallazgos || []).filter(h => 
        (h.estado === 'RECHAZADO' || h.estado === 'POR ENVIAR' || h.estado === 'PENDIENTE') && Number(h.precioVenta) > 0
    );

    if (pendientes.length > 0) {
        y += 5;
        doc.setFillColor(254, 242, 242);
        doc.roundedRect(14, y, 100, (pendientes.length * 7) + 12, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(185, 28, 28);
        doc.text('PENDIENTES (NO AUTORIZADOS)', 18, y + 6);
        
        y += 12;
        pendientes.forEach(p => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(50, 50, 50);
            doc.text(`• ${p.puntoFalla.toUpperCase()}`, 18, y);
            doc.text(`Ref: S/ ${Number(p.precioVenta).toFixed(2)}`, 95, y, { align: 'right' });
            y += 6;
        });
    }

    // --- 5. TOTALES ---
    const igv = subtotal * 0.18;
    const totalFinal = subtotal + igv;

    y = Math.max(y + 15, 235); 
    doc.setFontSize(10);
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('Subtotal:', 160, y, { align: 'right' });
    doc.setTextColor(...NEGRO);
    doc.text(`S/ ${subtotal.toFixed(2)}`, 195, y, { align: 'right' });
    
    y += 7;
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('IGV (18%):', 160, y, { align: 'right' });
    doc.setTextColor(...NEGRO);
    doc.text(`S/ ${igv.toFixed(2)}`, 195, y, { align: 'right' });
    
    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 130, y);
    doc.setTextColor(...AZUL_ACCENTO);
    doc.text(`S/ ${totalFinal.toFixed(2)}`, 195, y, { align: 'right' });

    // --- 6. FIRMAS ---
    y += 25;
    doc.setDrawColor(200);
    doc.line(30, y, 90, y);
    doc.line(120, y, 180, y);
    doc.setFontSize(8);
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('Dr. Motors', 60, y + 5, { align: 'center' });
    doc.text('Firma del Cliente', 150, y + 5, { align: 'center' });

    doc.save(`COTIZACION_${orden.cita?.vehiculo?.placa || 'REPORTE'}.pdf`);
};