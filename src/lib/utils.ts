import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formata CNPJ: 00.000.000/0000-00
export function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, '').slice(0,14);
  const parts = [] as string[];
  if (digits.length > 2) parts.push(digits.slice(0,2));
  if (digits.length > 5) parts.push(digits.slice(2,5));
  if (digits.length > 8) parts.push(digits.slice(5,8));
  if (digits.length > 12) {
    const base = digits.slice(8,12);
    const suffix = digits.slice(12,14);
    return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${base}-${suffix}`;
  }
  if (digits.length > 8) {
    return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8)}`;
  }
  if (digits.length > 5) {
    return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`;
  }
  if (digits.length > 2) {
    return `${digits.slice(0,2)}.${digits.slice(2)}`;
  }
  return digits;
}

// Formata celular/WhatsApp: (11) 99999-9999
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0,11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

export function isValidCNPJ(value: string) {
  const digits = value.replace(/\D/g,'');
  return digits.length === 14; // Validação simples (estrutura); regra completa poderia ser adicionada depois
}
