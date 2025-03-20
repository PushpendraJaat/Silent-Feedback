import DOMPurify from 'dompurify';

export function sanitizeInput(input: string) {
  return DOMPurify.sanitize(input);
}
