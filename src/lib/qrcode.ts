import QRCode from 'qrcode';
import { Invoice } from './types';
import { Locale } from './i18n';

/**
 * Generate a QR code data URL for bank transfer payment.
 * - SK locale: EPC QR code (SEPA Credit Transfer standard)
 * - US locale: Simple payment info QR
 */
export async function generatePaymentQR(invoice: Invoice, locale: Locale): Promise<string> {
  const data = locale === 'sk'
    ? buildEpcQrData(invoice)
    : buildUsPaymentQrData(invoice);

  if (!data) return '';

  try {
    return await QRCode.toDataURL(data, {
      width: 160,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
}

/**
 * EPC QR Code (European Payments Council) for SEPA credit transfers.
 * Standard: EPC069-12 - used by banks across Europe including Slovakia.
 */
function buildEpcQrData(invoice: Invoice): string | null {
  const iban = invoice.companyIban?.replace(/\s/g, '');
  if (!iban || !invoice.total) return null;

  const lines = [
    'BCD',                                      // Service Tag
    '002',                                      // Version
    '1',                                        // Encoding (UTF-8)
    'SCT',                                      // SEPA Credit Transfer
    invoice.companySwiftCode || '',              // BIC (optional)
    (invoice.companyLegalName || invoice.companyName).substring(0, 70), // Beneficiary name
    iban,                                        // IBAN
    `EUR${invoice.total.toFixed(2)}`,            // Amount
    '',                                         // Purpose code
    invoice.variableSymbol ? `VS${invoice.variableSymbol}` : '', // Reference
    invoice.invoiceNumber.substring(0, 140),     // Remittance text
    '',                                         // Information
  ];

  return lines.join('\n');
}

/**
 * Simple payment details QR for US invoices.
 */
function buildUsPaymentQrData(invoice: Invoice): string | null {
  if (!invoice.total) return null;

  const parts: string[] = [
    `PAY ${invoice.companyLegalName || invoice.companyName}`,
    `Invoice: ${invoice.invoiceNumber}`,
    `Amount: $${invoice.total.toFixed(2)}`,
  ];

  if (invoice.companyBankName) parts.push(`Bank: ${invoice.companyBankName}`);
  if (invoice.companyBankAccount) parts.push(`Account: ${invoice.companyBankAccount}`);
  if (invoice.companyRoutingNumber) parts.push(`Routing: ${invoice.companyRoutingNumber}`);

  return parts.join('\n');
}
