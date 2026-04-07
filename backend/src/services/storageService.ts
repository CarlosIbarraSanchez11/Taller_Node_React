// backend/src/services/storageService.ts

import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET_NAME = 'archivos-dr-motors';
// 🚀 CAMBIAMOS EL NOMBRE DE LA CARPETA AQUÍ
const FOLDER_NAME = 'gestion-taller-node'; 

export const uploadToGCS = async (buffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
    const bucket = storage.bucket(BUCKET_NAME);
    // Ahora usará: dr-motors-app/nombre-archivo.jpg
    const file = bucket.file(`${FOLDER_NAME}/${fileName}`);

    await file.save(buffer, {
        contentType: mimeType,
        resumable: false,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        }
    });

    return `https://storage.googleapis.com/${BUCKET_NAME}/${FOLDER_NAME}/${fileName}`;
};