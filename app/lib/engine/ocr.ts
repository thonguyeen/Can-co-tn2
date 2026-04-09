// ═══════════════════════════════════════════════════════
// CẦN & CÓ — OCR Engine (framework-agnostic)
// Ported from NHA.AI: apps/api/src/verify/ocr.service.ts
// ═══════════════════════════════════════════════════════

import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import type { CccdData, SodoData } from './types';

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();
}

async function runOcr(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
  const processed = await preprocessImage(imageBuffer);
  const worker = await createWorker('vie+eng');
  const { data } = await worker.recognize(processed);
  await worker.terminate();
  return { text: data.text, confidence: data.confidence };
}

// --- CCCD extraction helpers ---

function extractCccdId(text: string): string | null {
  const match = text.match(/\b\d{12}\b/);
  return match ? match[0] : null;
}

function extractCccdName(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('họ và tên') || line.includes('full name') || line.includes('ho va ten')) {
      const afterColon = lines[i].split(/[:：]/)[1]?.trim();
      if (afterColon && afterColon.length > 2) return afterColon.toUpperCase();
      if (lines[i + 1]) return lines[i + 1].trim().toUpperCase();
    }
  }
  return null;
}

function extractDob(text: string): string | null {
  const match = text.match(/\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\b/);
  return match ? match[1].replace(/[\-\.]/g, '/') : null;
}

function extractCccdAddress(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('nơi thường trú') || line.includes('place of residence') || line.includes('noi thuong tru')) {
      const afterColon = lines[i].split(/[:：]/)[1]?.trim();
      if (afterColon && afterColon.length > 5) return afterColon;
      const parts = [];
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        if (lines[j].length > 3 && !lines[j].toLowerCase().includes('ngày') && !lines[j].toLowerCase().includes('date')) {
          parts.push(lines[j]);
        } else break;
      }
      if (parts.length > 0) return parts.join(', ');
    }
  }
  return null;
}

// --- Sodo extraction helpers ---

function extractSodoOwner(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('người sử dụng') || line.includes('chủ sở hữu') || line.includes('tên chủ')) {
      const afterColon = lines[i].split(/[:：]/)[1]?.trim();
      if (afterColon && afterColon.length > 2) return afterColon;
      if (lines[i + 1] && lines[i + 1].length > 2) return lines[i + 1].trim();
    }
  }
  return null;
}

function extractLandNumber(text: string): string | null {
  const match = text.match(/[Tt]hửa\s*(?:đất\s*)?[Ss]ố[:\s]*(\d+)/);
  if (match) return match[1];
  const match2 = text.match(/[Tt]ờ\s*(?:bản đồ\s*)?[Ss]ố[:\s]*(\d+)/);
  return match2 ? match2[1] : null;
}

function extractSodoAddress(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('tại') && (line.includes('xã') || line.includes('phường') || line.includes('quận') || line.includes('huyện'))) {
      return lines[i].trim();
    }
  }
  return null;
}

// --- Public API ---

export async function processCccd(imageBuffer: Buffer): Promise<CccdData> {
  try {
    const { text, confidence } = await runOcr(imageBuffer);
    return {
      id_number: extractCccdId(text),
      full_name: extractCccdName(text),
      date_of_birth: extractDob(text),
      address: extractCccdAddress(text),
      raw_text: text,
      confidence,
    };
  } catch {
    return {
      id_number: null,
      full_name: null,
      date_of_birth: null,
      address: null,
      raw_text: '',
      confidence: 0,
    };
  }
}

export async function processSodo(imageBuffer: Buffer): Promise<SodoData> {
  try {
    const { text, confidence } = await runOcr(imageBuffer);
    return {
      owner_name: extractSodoOwner(text),
      land_number: extractLandNumber(text),
      address: extractSodoAddress(text),
      raw_text: text,
      confidence,
    };
  } catch {
    return {
      owner_name: null,
      land_number: null,
      address: null,
      raw_text: '',
      confidence: 0,
    };
  }
}
