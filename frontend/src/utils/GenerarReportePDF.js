import jsPDF from 'jspdf';

const BASE_URL = 'http://localhost:4000';
const EVIDENCIAS_URL = `${BASE_URL}/uploads/evidencias`;
const GESTION_URL = `${BASE_URL}/uploads/gestion`;
const LAVADO_URL = `${BASE_URL}/uploads/lavado`;
const ORDENES_URL = `${BASE_URL}/uploads/ordenes`;

const imageToBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

export const generarReportePDF = async (orden) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    // --- PALETA DE COLORES ---
    const AZUL_OSCURO = [30, 41, 59];
    const AZUL = [37, 99, 235];
    const VERDE = [22, 163, 74];
    const ROJO = [220, 38, 38];
    const AMARILLO = [202, 138, 4];
    const BLANCO = [255, 255, 255];

    // --- HELPERS ---
    const saltoSeguro = (alto = 10) => {
        if (y + alto > 275) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    };

    const dibujarTituloSeccion = (texto, color = AZUL) => {
        saltoSeguro(15);
        doc.setFontSize(10);
        doc.setTextColor(...color);
        doc.setFont('helvetica', 'bold');
        doc.text(texto.toUpperCase(), 14, y);
        y += 2;
        doc.setDrawColor(...color);
        doc.setLineWidth(0.5);
        doc.line(14, y, 40, y);
        y += 8;
    };

    // ─── 1. HEADER ──────────────────────────────────────────
    doc.setFillColor(...AZUL_OSCURO);
    doc.rect(0, 0, W, 40, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...BLANCO);
    doc.text('DR. MOTORS', 14, 18);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('REPORTE TÉCNICO INTEGRAL DE SERVICIO', 14, 26);
    
    doc.setTextColor(255, 255, 255);
    doc.text(`ORDEN: ${orden.id?.slice(-8).toUpperCase()}`, W - 14, 18, { align: 'right' });
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, W - 14, 26, { align: 'right' });

    y = 50;

    // ─── 2. INFO VEHÍCULO / CLIENTE ─────────────────────────
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, y, W - 28, 22, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('CLIENTE', 18, y + 6);
    doc.text('VEHÍCULO', 80, y + 6);
    doc.text('KM / COMBUSTIBLE', 150, y + 6);
    
    doc.setTextColor(...AZUL_OSCURO);
    doc.setFontSize(9);
    doc.text(`${orden.cita?.vehiculo?.cliente?.nombres} ${orden.cita?.vehiculo?.cliente?.apellidos}`, 18, y + 12);
    doc.text(`${orden.cita?.vehiculo?.marca} ${orden.cita?.vehiculo?.modelo} (${orden.cita?.vehiculo?.placa})`, 80, y + 12);
    doc.text(`${orden.kilometraje?.toLocaleString()} KM | ${orden.nivelCombustible}`, 150, y + 12);
    y += 35;

    // ─── 3. INVENTARIO DE RECEPCIÓN ─────────────────────────
    dibujarTituloSeccion('Inventario de Recepción');
    const inventario = orden.inventario || [];
    const colW = (W - 28) / 2;
    doc.setFontSize(8);
    
    inventario.forEach((item, i) => {
        const col = i % 2;
        const px = 14 + (col * colW);
        const py = y + (Math.floor(i / 2) * 7);
        saltoSeguro(7);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(`• ${item.nombre}`, px + 2, py);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...(item.estado ? VERDE : ROJO));
        doc.text(item.estado ? '[OK]' : '[NO]', px + colW - 12, py);
    });
    y += (Math.ceil(inventario.length / 2) * 7) + 10;

    // ─── 4. FOTOS DE REGISTRO (INGRESO) ──────────────────────
    const llaveFotos = Object.keys(orden).find(key => 
        Array.isArray(orden[key]) && 
        orden[key].length > 0 && 
        typeof orden[key][0] === 'string' && // ✅ ESTA ES LA LÍNEA CLAVE
        orden[key][0].startsWith('FOTO-')
    );
    
    const fotosRegistro = orden.ordentrabajo || orden.fotos || [];

    if (fotosRegistro.length > 0) {
        dibujarTituloSeccion('Fotos de Registro de Ingreso');
        const fW = 58;
        const fH = 40;
        let col = 0;
        for (const f of fotosRegistro) {
            // Solo intentamos procesar si es un string (nombre de archivo)
            if (typeof f !== 'string') continue;

            if (col === 3) { col = 0; y += fH + 5; }
            saltoSeguro(fH + 5);
            const b64 = await imageToBase64(`${ORDENES_URL}/${f}`);
            if (b64) {
                doc.addImage(b64, 'JPEG', 14 + (col * (fW + 4)), y, fW, fH);
                col++;
            }
        }
        y += fH + 15;
    }

    // ─── 5. INSPECCIÓN TÉCNICA DETALLADA ─────────────────────
    doc.addPage(); 
    y = 20;
    dibujarTituloSeccion('Inspección Técnica Detallada');
    const inspeccionData = typeof orden.inspeccionTecnica === 'string' 
        ? JSON.parse(orden.inspeccionTecnica) 
        : (orden.inspeccionTecnica || {});

    for (const [sector, data] of Object.entries(inspeccionData)) {
        saltoSeguro(20);
        doc.setFillColor(...AZUL_OSCURO);
        doc.roundedRect(14, y, W - 28, 8, 1, 1, 'F');
        doc.setTextColor(...BLANCO);
        doc.setFontSize(9);
        doc.text(`SISTEMA: ${sector.toUpperCase()}`, 18, y + 5.5);
        y += 12;

        const tareas = data.tareas || [];
        const cardW = 43;
        const cardH = 45;
        let col = 0;

        for (const t of tareas) {
            if (col === 4) { col = 0; y += cardH + 5; }
            saltoSeguro(cardH + 10);
            const px = 14 + (col * (cardW + 3));

            doc.setDrawColor(230);
            doc.roundedRect(px, y, cardW, cardH, 2, 2, 'D');

            doc.setFontSize(6.5);
            doc.setTextColor(50, 50, 50);
            doc.text(t.tarea.substring(0, 25).toUpperCase(), px + 2, y + 5);

            let bCol = (t.estado === 'OK') ? VERDE : (t.estado === 'REGULAR' ? AMARILLO : ROJO);
            doc.setFillColor(...bCol);
            doc.roundedRect(px + cardW - 12, y + 2, 10, 4, 1, 1, 'F');
            doc.setTextColor(...BLANCO);
            doc.setFontSize(5);
            doc.text(t.estado, px + cardW - 7, y + 4.8, { align: 'center' });

            if (t.foto) {
                const b64 = await imageToBase64(`${GESTION_URL}/${t.foto}`);
                if (b64) doc.addImage(b64, 'JPEG', px + 2, y + 8, cardW - 4, 32);
            } else {
                doc.setFillColor(245);
                doc.rect(px + 2, y + 8, cardW - 4, 32, 'F');
                doc.setTextColor(180);
                doc.text('SIN IMAGEN', px + cardW / 2, y + 25, { align: 'center' });
            }
            col++;
        }
        y += cardH + 10;
    }

    // ─── 6. HALLAZGOS Y EVIDENCIAS ──────────────────────────
    if (orden.hallazgos?.length > 0) {
        doc.addPage();
        y = 20;
        dibujarTituloSeccion('Evidencias del Trabajo Realizado');
        for (const h of orden.hallazgos) {
            saltoSeguro(55);
            const imgPath = h.fotoInstalacion || h.foto;
            if (imgPath) {
                const b64 = await imageToBase64(`${EVIDENCIAS_URL}/${imgPath}`);
                if (b64) doc.addImage(b64, 'JPEG', 14, y, 65, 45);
            }
            doc.setFontSize(10);
            doc.setTextColor(...AZUL_OSCURO);
            doc.text(h.puntoFalla.toUpperCase(), 85, y + 5);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            const desc = doc.splitTextToSize(h.descripcion || 'Reparación efectuada.', 105);
            doc.text(desc, 85, y + 12);
            y += 55;
        }
    }

    // ─── 7. CONTROL DE LAVADO FINAL ─────────────────────────
    if (orden.cita?.lavado?.fotoFinal) {
        doc.addPage();
        y = 20;
        dibujarTituloSeccion('Control de Entrega y Lavado', VERDE);
        const b64Lavado = await imageToBase64(`${LAVADO_URL}/${orden.cita.lavado.fotoFinal}`);
        if (b64Lavado) {
            doc.addImage(b64Lavado, 'JPEG', 14, y, W - 28, 80);
            y += 85;
        }
        doc.setFontSize(9);
        doc.setTextColor(...VERDE);
        doc.text('VIGILANCIA DE CALIDAD: Vehículo inspeccionado y listo para entrega.', 14, y);
    }

    // --- FOOTER ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`DR. MOTORS - Reporte de Servicio Digital - Página ${i} de ${totalPages}`, W / 2, 290, { align: 'center' });
    }

    doc.save(`REPORTE_DR_MOTORS_${orden.cita?.vehiculo?.placa || 'REPORTE'}.pdf`);
};