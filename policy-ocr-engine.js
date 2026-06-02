/*
|--------------------------------------------------------------------------
| MODULE: policy-ocr-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.2.0
|
|--------------------------------------------------------------------------
|
| OCR/Text extraction foundation para pólizas y cotizaciones PDF.
|
| Nota:
| En entorno local/Termux usa pdftotext.
| En producción esto podrá cambiarse por backend OCR/Vision API.
|
|--------------------------------------------------------------------------
*/

import { spawnSync } from 'node:child_process';

export async function extraerTextoOCR({
    file,
    filePath
}) {
    const inputPath = filePath || file;

    if (!inputPath) {
        throw new Error('Archivo requerido');
    }

    const result = spawnSync(
        'pdftotext',
        [
            inputPath,
            '-'
        ],
        {
            encoding: 'utf8'
        }
    );

    if (result.error) {
        return {
            status: 'ocr_failed',
            extractedText: '',
            error: result.error.message
        };
    }

    if (result.status !== 0) {
        return {
            status: 'ocr_failed',
            extractedText: '',
            error: result.stderr || 'pdftotext failed'
        };
    }

    const extractedText = String(result.stdout || '').trim();

    return {
        status: extractedText
            ? 'ocr_complete'
            : 'ocr_empty',
        extractedText,
        source: 'pdftotext'
    };
}
