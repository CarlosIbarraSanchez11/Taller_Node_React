import jsPDF from 'jspdf';

// ☁️ CONFIGURACIÓN DE RUTAS DE GOOGLE CLOUD STORAGE
const CLOUD_BASE = 'https://storage.googleapis.com/taller-dr-motors-storage/gestion-taller-node';
const URL_RECEPCION = `${CLOUD_BASE}/recepcion`;
const URL_INSPECCION = `${CLOUD_BASE}/inspeccion`;
const URL_LAVADO = `${CLOUD_BASE}/lavado`;
const URL_EVIDENCIAS = `${CLOUD_BASE}/evidencias`;
const URL_HALLAZGOS = `${CLOUD_BASE}/hallazgos`;

const imageToBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        // 🛡️ CRUCIAL: Esto permite que Canvas lea la imagen desde el dominio de Google
        img.crossOrigin = 'anonymous'; 
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            // Comprimimos un poco más el PDF bajando calidad a 0.6
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (err) => {
            console.error("❌ Error cargando imagen para PDF:", url, err);
            resolve(null);
        };
        img.src = url;
    });
};

export const generarReportePDF = async (orden) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    // --- COLORES CORPORATIVOS DR. MOTORS ---
    const AZUL_OSCURO = [30, 41, 59];
    const AZUL = [37, 99, 235];
    const VERDE = [22, 163, 74];
    const ROJO = [220, 38, 38];
    const AMARILLO = [202, 138, 4];
    const BLANCO = [255, 255, 255];

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
    doc.text('REPORTE TÉCNICO DIGITAL - IPS GLOBAL', 14, 26);
    
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

    // ─── 3. INVENTARIO ──────────────────────────────────────
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

    // ─── 4. FOTOS DE REGISTRO (RECEPCIÓN EN NUBE) ──────────
    const fotosRegistro = Array.isArray(orden.fotos) ? orden.fotos : [];
    if (fotosRegistro.length > 0) {
        dibujarTituloSeccion('Registro Fotográfico de Ingreso');
        const fW = 58;
        const fH = 40;
        let col = 0;
        for (const f of fotosRegistro) {
            if (col === 3) { col = 0; y += fH + 5; }
            saltoSeguro(fH + 5);
            // 🚀 URL de Recepción
            const b64 = await imageToBase64(`${URL_RECEPCION}/${f}`);
            if (b64) {
                doc.addImage(b64, 'JPEG', 14 + (col * (fW + 4)), y, fW, fH);
                col++;
            }
        }
        y += fH + 15;
    }

    // ─── 5. INSPECCIÓN TÉCNICA (INSPECCION EN NUBE) ─────────
    doc.addPage(); y = 20;
    dibujarTituloSeccion('Detalle de Inspección Técnica');
    const inspeccionData = typeof orden.inspeccionTecnica === 'string' 
        ? JSON.parse(orden.inspeccionTecnica) 
        : (orden.inspeccionTecnica || {});

    for (const [sector, data] of Object.entries(inspeccionData)) {
        saltoSeguro(20);
        doc.setFillColor(...AZUL_OSCURO);
        doc.roundedRect(14, y, W - 28, 8, 1, 1, 'F');
        doc.setTextColor(...BLANCO);
        doc.setFontSize(8);
        doc.text(`SISTEMA: ${sector.toUpperCase()}`, 18, y + 5.5);
        y += 12;

        const tareas = data.tareas || [];
        let col = 0;
        for (const t of tareas) {
            if (col === 4) { col = 0; y += 50; }
            saltoSeguro(50);
            const px = 14 + (col * 46);
            
            doc.setDrawColor(240);
            doc.roundedRect(px, y, 43, 45, 2, 2, 'D');
            doc.setFontSize(6);
            doc.setTextColor(50, 50, 50);
            doc.text(t.tarea.substring(0, 30).toUpperCase(), px + 2, y + 5);

            if (t.foto) {
                // 🚀 URL de Inspección
                const b64 = await imageToBase64(`${URL_INSPECCION}/${t.foto}`);
                if (b64) doc.addImage(b64, 'JPEG', px + 2, y + 8, 39, 34);
            }
            col++;
        }
        y += 55;
    }

    // ─── 6. EVIDENCIAS DE TRABAJO (EVIDENCIAS/HALLAZGOS) ────
    if (orden.hallazgos?.length > 0) {
        doc.addPage(); y = 20;
        dibujarTituloSeccion('Evidencias de Trabajo Realizado');
        for (const h of orden.hallazgos) {
            saltoSeguro(60);
            
            // Lógica de URL Dinámica
            const urlImg = h.fotoInstalacion 
                ? `${URL_EVIDENCIAS}/${h.fotoInstalacion}` 
                : `${URL_HALLAZGOS}/${h.foto}`;

            const b64 = await imageToBase64(urlImg);
            if (b64) doc.addImage(b64, 'JPEG', 14, y, 70, 50);

            doc.setFontSize(10);
            doc.setTextColor(...AZUL_OSCURO);
            doc.text(h.puntoFalla.toUpperCase(), 90, y + 5);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            const desc = doc.splitTextToSize(h.descripcion || 'Servicio completado.', 100);
            doc.text(desc, 90, y + 12);
            y += 60;
        }
    }

    // ─── 7. LAVADO FINAL ───────────────────────────────────
    if (orden.cita?.lavado?.fotoFinal) {
        doc.addPage(); y = 20;
        dibujarTituloSeccion('Control de Calidad y Entrega', VERDE);
        // 🚀 URL de Lavado
        const b64Lavado = await imageToBase64(`${URL_LAVADO}/${orden.cita.lavado.fotoFinal}`);
        if (b64Lavado) {
            doc.addImage(b64Lavado, 'JPEG', 14, y, W - 28, 90);
            y += 95;
        }
        doc.setFontSize(10);
        doc.setTextColor(...VERDE);
        doc.text('ESTADO FINAL: VEHÍCULO LISTO PARA ENTREGA', W / 2, y, { align: 'center' });
    }

    // --- PIE DE PÁGINA ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`DR. MOTORS - Página ${i} de ${totalPages} - Reporte Generado Digitalmente`, W / 2, 290, { align: 'center' });
    }

    doc.save(`REPORTE_${orden.cita?.vehiculo?.placa || 'DRMOTORS'}.pdf`);
};