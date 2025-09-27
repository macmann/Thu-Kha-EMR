import OpenAI from 'openai';

export interface InvoiceScanLineItem {
  brandName?: string | null;
  genericName?: string | null;
  form?: string | null;
  strength?: string | null;
  packageDescription?: string | null;
  quantity?: number | null;
  unitCost?: number | null;
  batchNumber?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  suggestedLocation?: string | null;
}

export interface InvoiceScanMetadata {
  vendor?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  currency?: string | null;
  subtotal?: number | null;
  total?: number | null;
  destination?: string | null;
}

export interface InvoiceScanResult {
  metadata: InvoiceScanMetadata;
  lineItems: InvoiceScanLineItem[];
  warnings: string[];
  rawText?: string | null;
}

export class InvoiceScanError extends Error {
  statusCode?: number;
  details?: unknown;

  constructor(message: string, options?: { statusCode?: number; cause?: unknown; details?: unknown }) {
    super(message);
    this.name = 'InvoiceScanError';
    this.statusCode = options?.statusCode;
    this.details = options?.details;
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

const DEFAULT_MODEL = 'gpt-4o-mini';
let cachedClient: OpenAI | null = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new InvoiceScanError('OpenAI API key is not configured. Set OPENAI_API_KEY to enable invoice scanning.', {
      statusCode: 503,
    });
  }
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }
  return cachedClient;
}

function ensureJsonObject(content: string) {
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new InvoiceScanError('Unable to parse invoice response from OpenAI.', {
      statusCode: 502,
    });
  }
  const jsonSlice = content.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonSlice);
  } catch (error) {
    throw new InvoiceScanError('Invoice parsing returned invalid JSON data.', {
      statusCode: 502,
      cause: error,
    });
  }
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  return null;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function buildSchema() {
  return {
    name: 'pharmacy_invoice_extraction',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['lineItems'],
      properties: {
        rawText: { type: 'string', description: 'Full transcription of the invoice if helpful', nullable: true },
        warnings: {
          type: 'array',
          description: 'Any issues or ambiguities detected while reading the invoice.',
          items: { type: 'string' },
        },
        metadata: {
          type: 'object',
          additionalProperties: false,
          properties: {
            vendor: { type: 'string', nullable: true },
            invoiceNumber: { type: 'string', nullable: true },
            invoiceDate: {
              type: 'string',
              nullable: true,
              description: 'ISO 8601 date (YYYY-MM-DD) for the invoice',
            },
            currency: { type: 'string', nullable: true },
            subtotal: { type: 'number', nullable: true },
            total: { type: 'number', nullable: true },
            destination: {
              type: 'string',
              nullable: true,
              description: 'Receiving location or department if present on the invoice',
            },
          },
          required: [],
        },
        lineItems: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              brandName: { type: 'string', nullable: true },
              genericName: { type: 'string', nullable: true },
              form: { type: 'string', nullable: true },
              strength: { type: 'string', nullable: true },
              packageDescription: { type: 'string', nullable: true },
              quantity: { type: 'number', nullable: true },
              unitCost: { type: 'number', nullable: true },
              batchNumber: { type: 'string', nullable: true },
              expiryDate: {
                type: 'string',
                nullable: true,
                description: 'ISO 8601 date (YYYY-MM-DD) representing the expiration date',
              },
              notes: { type: 'string', nullable: true },
              suggestedLocation: {
                type: 'string',
                nullable: true,
                description: 'Storage or destination hinted at by the invoice line if provided',
              },
            },
            required: [],
          },
        },
      },
    },
    strict: true,
  } as const;
}

export async function scanInvoice(buffer: Buffer, mimeType?: string | null): Promise<InvoiceScanResult> {
  if (!buffer.length) {
    throw new InvoiceScanError('Invoice file is empty.', { statusCode: 400 });
  }

  const client = getClient();
  const model = process.env.OPENAI_INVOICE_MODEL || DEFAULT_MODEL;
  const base64 = buffer.toString('base64');
  const imageUrl = `data:${mimeType || 'application/octet-stream'};base64,${base64}`;

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0,
      response_format: { type: 'json_schema', json_schema: buildSchema() },
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that extracts structured pharmacy inventory data from supplier invoices. ' +
            'Return JSON that matches the provided schema. ' +
            'Capture medication names, strengths, forms, quantities, batch or lot numbers, expiration dates, and unit costs when available. ' +
            'If values are not provided, use null.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Read this invoice and summarize each medication line. ' +
                'Please keep numbers as digits and use ISO 8601 dates (YYYY-MM-DD).',
            },
            {
              type: 'image_url',
              image_url: imageUrl,
            },
          ],
        },
      ],
    });

    const message = response.choices?.[0]?.message?.content;
    if (!message) {
      throw new InvoiceScanError('OpenAI returned an empty response for the invoice.', {
        statusCode: 502,
      });
    }

    const textContent = Array.isArray(message)
      ? message
          .map((part) => ('text' in part ? part.text : typeof part === 'string' ? part : ''))
          .join('')
      : message;

    const parsed = ensureJsonObject(textContent);
    const rawWarnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];
    const metadata = parsed.metadata ?? {};
    const normalizedMetadata: InvoiceScanMetadata = {
      vendor: normalizeString(metadata.vendor),
      invoiceNumber: normalizeString(metadata.invoiceNumber),
      invoiceDate: normalizeDate(metadata.invoiceDate),
      currency: normalizeString(metadata.currency),
      subtotal: normalizeNumber(metadata.subtotal),
      total: normalizeNumber(metadata.total),
      destination: normalizeString(metadata.destination),
    };

    const lineItemsSource = Array.isArray(parsed.lineItems) ? parsed.lineItems : [];
    const lineItems: InvoiceScanLineItem[] = lineItemsSource.map((item: Record<string, unknown>) => ({
      brandName: normalizeString(item.brandName),
      genericName: normalizeString(item.genericName),
      form: normalizeString(item.form),
      strength: normalizeString(item.strength),
      packageDescription: normalizeString(item.packageDescription),
      quantity: normalizeNumber(item.quantity),
      unitCost: normalizeNumber(item.unitCost),
      batchNumber: normalizeString(item.batchNumber),
      expiryDate: normalizeDate(item.expiryDate),
      notes: normalizeString(item.notes),
      suggestedLocation: normalizeString(item.suggestedLocation),
    }));

    return {
      metadata: normalizedMetadata,
      lineItems,
      warnings: rawWarnings.map((warning: unknown) => normalizeString(warning) || 'Unspecified issue detected during parsing.'),
      rawText: normalizeString(parsed.rawText),
    };
  } catch (error) {
    if (error instanceof InvoiceScanError) {
      throw error;
    }
    throw new InvoiceScanError('Unable to analyze the invoice automatically. Please enter details manually.', {
      statusCode: 502,
      cause: error,
    });
  }
}
