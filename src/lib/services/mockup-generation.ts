/**
 * Mockup Generation Service - Provider Agnostic
 *
 * Supports multiple providers for generating product mockups from a logo image:
 * - mockupsjar  (100 free renders/month, 700+ templates)
 * - dynamicmockups (1,000 free renders forever, 0.6-2.8s per render)
 * - mockcity  (credit-based, any PSD template, cloud workers)
 *
 * Switch providers by setting MOCKUP_PROVIDER env var.
 *
 * Logo images can be passed as:
 * - Public URLs (https://...) — used directly
 * - Base64 data URLs (data:image/png;base64,...) — automatically resolved:
 *   - Dynamic Mockups: sent as binary via FormData (no hosting needed)
 *   - Other providers: uploaded via image-hosting utility (imgbb or local serve)
 */

import { resolveImageUrl, decodeDataUrl } from './image-hosting';
// sharp is dynamically imported in functions that need it to avoid bundling in client code

export type MockupProvider = 'mockupsjar' | 'dynamicmockups' | 'mockcity';

export type MockupProductType = 'tshirt' | 'mug' | 'totebag' | 'businesscard' | 'letterhead' | 'hoodie' | 'phone-case';

export interface MockupOptions {
  /** Public URL of the logo image to composite onto product */
  logoUrl: string;
  /** Product type to generate */
  productType: MockupProductType;
  /** Optional background color hex for the product (e.g. '#ffffff') */
  productColor?: string;
  /** Optional output format */
  format?: 'png' | 'jpg' | 'webp';
  /** Business name (used for text layers if supported) */
  businessName?: string;
}

export interface MockupResult {
  /** URL of the rendered mockup image */
  imageUrl: string;
  /** Which provider generated it */
  provider: MockupProvider;
  /** Product type */
  productType: MockupProductType;
  /** Estimated cost for this render */
  cost?: number;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Generate a single product mockup using the configured provider
 */
export async function generateMockup(options: MockupOptions): Promise<MockupResult> {
  const provider = (process.env.MOCKUP_PROVIDER as MockupProvider) || 'dynamicmockups';

  console.log(`[Mockup] Generating ${options.productType} mockup via ${provider}...`);

  // Dynamic Mockups handles base64 natively via FormData binary upload,
  // so no URL resolution needed. Other providers need a public URL.
  let resolvedOptions = options;
  if (provider !== 'dynamicmockups' && options.logoUrl.startsWith('data:')) {
    console.log(`[Mockup] Resolving base64 data URL to public URL for ${provider}...`);
    const publicUrl = await resolveImageUrl(options.logoUrl);
    resolvedOptions = { ...options, logoUrl: publicUrl };
  }

  switch (provider) {
    case 'mockupsjar':
      return generateWithMockupsJar(resolvedOptions);
    case 'mockcity':
      return generateWithMockCity(resolvedOptions);
    case 'dynamicmockups':
    default:
      return generateWithDynamicMockups(options); // Uses original options (may be base64)
  }
}

/**
 * Generate multiple product mockups (e.g. t-shirt + mug + tote bag)
 */
export async function generateMultipleMockups(
  logoUrl: string,
  productTypes: MockupProductType[],
  extraOptions?: Partial<MockupOptions>
): Promise<MockupResult[]> {
  const results: MockupResult[] = [];

  for (const productType of productTypes) {
    try {
      const result = await generateMockup({
        logoUrl,
        productType,
        ...extraOptions,
      });
      results.push(result);
    } catch (error) {
      console.error(`[Mockup] Failed to generate ${productType}:`, error);
    }
  }

  return results;
}

/**
 * Get info about the current provider (for test/debug routes)
 */
export function getProviderInfo(): {
  provider: MockupProvider;
  configured: boolean;
  keyName: string;
  docsUrl: string;
  freeQuota: string;
} {
  const provider = (process.env.MOCKUP_PROVIDER as MockupProvider) || 'dynamicmockups';

  const info: Record<MockupProvider, { keyName: string; docsUrl: string; freeQuota: string }> = {
    mockupsjar: {
      keyName: 'MOCKUPSJAR_API_KEY',
      docsUrl: 'https://mockupsjar.com/apidoc',
      freeQuota: '100 renders/month free',
    },
    dynamicmockups: {
      keyName: 'DYNAMIC_MOCKUPS_API_KEY',
      docsUrl: 'https://docs.dynamicmockups.com',
      freeQuota: '1,000 renders free forever (with watermark)',
    },
    mockcity: {
      keyName: 'MOCKCITY_API_KEY',
      docsUrl: 'https://mockcity.com/api/docs',
      freeQuota: 'Credit-based (pay as you go)',
    },
  };

  const providerInfo = info[provider];

  return {
    provider,
    configured: !!process.env[providerInfo.keyName],
    ...providerInfo,
  };
}


// ==================== Provider Implementations ====================

// ---------- Template Slug / UUID Mappings ----------
// These map our generic product types to provider-specific template IDs.
// Update these after browsing each provider's template library.

const MOCKUPSJAR_TEMPLATES: Partial<Record<MockupProductType, string>> = {
  tshirt: 'bella-canvas-3001-t-shirt-mockup',       // Update with actual slug from their library
  mug: 'white-ceramic-mug-mockup',                  // Update with actual slug
  totebag: 'canvas-tote-bag-mockup',                // Update with actual slug
  hoodie: 'gildan-hoodie-mockup',                   // Update with actual slug
  'phone-case': 'iphone-15-case-mockup',            // Update with actual slug
};

const DYNAMIC_MOCKUPS_TEMPLATES: Partial<Record<MockupProductType, { mockup_uuid: string; smart_object_uuid: string }>> = {
  // These UUIDs need to be populated from the Dynamic Mockups library
  // Sign up at https://dynamicmockups.com, browse templates, copy UUIDs
  tshirt: {
    mockup_uuid: '33192bb9-f197-4a5d-bccc-6e22f442a844',       // e.g. '6308f2f7-80eb-42ab-a109-08a33e6dcc2d'
    smart_object_uuid: '6784a400-3306-4bdd-996b-96bbee77a2e3', // e.g. '22ec3dec-4df8-4643-8c68-01b72fa506f5'
  },
  mug: {
    mockup_uuid: '634f7bda-e705-4336-a822-338c99506fa9',
    smart_object_uuid: '423df833-98a4-4887-94fc-f63c3ab2ca96',
  },
  totebag: {
    mockup_uuid: '32b4ce56-ab4a-4251-9a70-6c4ee7f04f96',
    smart_object_uuid: '04144afa-b2fd-4e74-839d-df21db16e67f',
  },
};

// MockCity uses your own PSD files — no fixed template mapping needed.
// You upload a PSD and the API finds SmartObjects automatically.
const MOCKCITY_PSD_URLS: Partial<Record<MockupProductType, string>> = {
  // Set these to URLs of your PSD templates (e.g. from CreativeMarket)
  // or leave empty to use MockCity's free library
  tshirt: '',
  mug: '',
  totebag: '',
};


// ==================== MockupsJar ====================

async function generateWithMockupsJar(options: MockupOptions): Promise<MockupResult> {
  const apiKey = process.env.MOCKUPSJAR_API_KEY;
  if (!apiKey) {
    throw new Error(
      'MOCKUPSJAR_API_KEY not set. Sign up at https://mockupsjar.com/api (100 free renders/month).'
    );
  }

  const templateSlug = MOCKUPSJAR_TEMPLATES[options.productType];
  if (!templateSlug) {
    throw new Error(
      `No MockupsJar template configured for "${options.productType}". ` +
      `Browse templates at https://mockupsjar.com/mockups and update MOCKUPSJAR_TEMPLATES in mockup-generation.ts`
    );
  }

  const response = await fetch(`https://api.mockupsjar.com/mockups/render/${templateSlug}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [options.logoUrl],
      zoomLevel: 1,
      format: options.format || 'png',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MockupsJar error (${response.status}): ${error}`);
  }

  const data = await response.json();

  if (data.data?.status !== 'successful') {
    throw new Error(`MockupsJar render failed: ${JSON.stringify(data)}`);
  }

  return {
    imageUrl: data.data.result.url,
    provider: 'mockupsjar',
    productType: options.productType,
    cost: 0, // Free tier: 100/month
    metadata: {
      templateSlug,
      previewUrl: data.data.result.previewUrl,
    },
  };
}


// ==================== Dynamic Mockups ====================

async function generateWithDynamicMockups(options: MockupOptions): Promise<MockupResult> {
  const apiKey = process.env.DYNAMIC_MOCKUPS_API_KEY;
  if (!apiKey) {
    throw new Error(
      'DYNAMIC_MOCKUPS_API_KEY not set. Sign up at https://dynamicmockups.com (1,000 free renders, no CC required).'
    );
  }

  const template = DYNAMIC_MOCKUPS_TEMPLATES[options.productType];
  if (!template || !template.mockup_uuid) {
    throw new Error(
      `No Dynamic Mockups template configured for "${options.productType}". ` +
      `Browse templates at https://dynamicmockups.com, copy the mockup_uuid and smart_object_uuid, ` +
      `and update DYNAMIC_MOCKUPS_TEMPLATES in mockup-generation.ts`
    );
  }

  const isBase64 = options.logoUrl.startsWith('data:');
  let response: Response;

  if (isBase64) {
    // Binary upload via FormData — no public URL needed
    console.log('[Mockup] Dynamic Mockups: using FormData binary upload for base64 image');
    const { buffer, extension } = decodeDataUrl(options.logoUrl);

    let finalBuffer = buffer;
    let finalExtension = extension;

    // Convert SVG to PNG if needed
    if (extension === 'svg+xml') {
      console.log('[Mockup] Converting SVG logo to PNG for mockup API');
      // Dynamic import to avoid bundling sharp in client code
      const sharp = (await import('sharp')).default;
      finalBuffer = await sharp(Buffer.from(buffer)).png().toBuffer();
      finalExtension = 'png';
    }

    const blob = new Blob([finalBuffer], { type: `image/${finalExtension}` });

    const formData = new FormData();
    formData.append('mockup_uuid', template.mockup_uuid);
    formData.append('smart_objects[0][uuid]', template.smart_object_uuid);
    formData.append('smart_objects[0][asset][file]', blob, `logo.${finalExtension}`);
    if (options.productColor) {
      formData.append('smart_objects[0][color]', options.productColor);
    }
    if (options.format) {
      formData.append('format', options.format);
    }

    response = await fetch('https://app.dynamicmockups.com/api/v1/renders', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      body: formData,
    });
  } else {
    // URL-based upload via JSON
    const smartObject: Record<string, unknown> = {
      uuid: template.smart_object_uuid,
      asset: {
        url: options.logoUrl,
      },
    };

    if (options.productColor) {
      smartObject.color = options.productColor;
    }

    response = await fetch('https://app.dynamicmockups.com/api/v1/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        mockup_uuid: template.mockup_uuid,
        smart_objects: [smartObject],
        ...(options.format ? { format: options.format } : {}),
      }),
    });
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dynamic Mockups error (${response.status}): ${error}`);
  }

  const data = await response.json();
  
  console.log('[DynamicMockups] Raw API response:', JSON.stringify(data, null, 2));
  
  const imageUrl = data.url || data.image_url || data.data?.url || data.result?.url;
  
  if (!imageUrl) {
    console.error('[DynamicMockups] No image URL found in response. Available keys:', Object.keys(data));
  } else {
    console.log('[DynamicMockups] Extracted imageUrl:', imageUrl.substring(0, 100) + '...');
  }

  return {
    imageUrl: imageUrl || '',
    provider: 'dynamicmockups',
    productType: options.productType,
    cost: 0, // Free tier: 1,000 renders (with watermark)
    metadata: {
      mockupUuid: template.mockup_uuid,
      renderTime: data.render_time,
      rawResponse: data,
    },
  };
}


// ==================== MockCity ====================

/**
 * MockCity uses a worker-based architecture:
 * 1. Spawn/wake a worker with a PSD template
 * 2. Send logo image to the worker's SmartObject
 * 3. Export the rendered mockup
 *
 * Workers take 15-20s to spawn, then 5-10s per render.
 * Workers auto-sleep after inactivity. State is lost after 72h.
 */
async function generateWithMockCity(options: MockupOptions): Promise<MockupResult> {
  const apiKey = process.env.MOCKCITY_API_KEY;
  if (!apiKey) {
    throw new Error(
      'MOCKCITY_API_KEY not set. Sign up at https://mockcity.com (credit-based, any PSD template).'
    );
  }

  const psdUrl = MOCKCITY_PSD_URLS[options.productType];

  // Step 1: Spawn a worker
  const spawnResponse = await fetch('https://api.mockcity.com/v1/workers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(psdUrl ? { psd_url: psdUrl } : { template: options.productType }),
    }),
  });

  if (!spawnResponse.ok) {
    const error = await spawnResponse.text();
    throw new Error(`MockCity spawn error (${spawnResponse.status}): ${error}`);
  }

  const worker = await spawnResponse.json();
  const workerId = worker.id || worker.worker_id;

  // Step 2: Wait for worker to be ready (poll status)
  await waitForMockCityWorker(workerId, apiKey);

  // Step 3: Get SmartObjects from the PSD
  const objectsResponse = await fetch(`https://api.mockcity.com/v1/workers/${workerId}/smart-objects`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!objectsResponse.ok) {
    throw new Error(`MockCity smart-objects error: ${await objectsResponse.text()}`);
  }

  const objects = await objectsResponse.json();
  const targetObject = objects[0]; // Use the first SmartObject

  if (!targetObject) {
    throw new Error('No SmartObjects found in the PSD template');
  }

  // Step 4: Place logo image into the SmartObject
  const placeResponse = await fetch(
    `https://api.mockcity.com/v1/workers/${workerId}/smart-objects/${targetObject.id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: options.logoUrl,
      }),
    }
  );

  if (!placeResponse.ok) {
    throw new Error(`MockCity place error: ${await placeResponse.text()}`);
  }

  // Step 5: Export the rendered mockup
  const exportResponse = await fetch(`https://api.mockcity.com/v1/workers/${workerId}/export`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      format: options.format || 'png',
    }),
  });

  if (!exportResponse.ok) {
    throw new Error(`MockCity export error: ${await exportResponse.text()}`);
  }

  const exportData = await exportResponse.json();

  // Step 6: Put worker to sleep to save credits
  fetch(`https://api.mockcity.com/v1/workers/${workerId}/sleep`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
  }).catch(() => {}); // Fire and forget

  return {
    imageUrl: exportData.url || exportData.image_url,
    provider: 'mockcity',
    productType: options.productType,
    cost: undefined, // Credit-based, varies
    metadata: {
      workerId,
      smartObjectId: targetObject.id,
    },
  };
}

async function waitForMockCityWorker(workerId: string, apiKey: string): Promise<void> {
  const maxAttempts = 30; // ~60 seconds max (2s intervals)
  const delayMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.mockcity.com/v1/workers/${workerId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`MockCity worker status error: ${await response.text()}`);
    }

    const data = await response.json();

    if (data.status === 'ready' || data.status === 'active') {
      return;
    }

    if (data.status === 'failed' || data.status === 'error') {
      throw new Error(`MockCity worker failed: ${JSON.stringify(data)}`);
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('MockCity worker spawn timed out (60s)');
}
