import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { db } from "@/lib/db";
import { settings as settingsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getPaddleApiKey(): Promise<string> {
  const paddleSettings = await db.query.settings.findFirst({
    where: eq(settingsTable.param, 'paddle'),
  });
  if (!paddleSettings || !paddleSettings.value) {
    throw new Error('Paddle API key not found in settings');
  }
  const paddleConfig = JSON.parse(paddleSettings.value as string);
  return paddleConfig.apiKey;
}

export async function getPaddleEnvironment(): Promise<Environment> {
    const paddleSettings = await db.query.settings.findFirst({
        where: eq(settingsTable.param, 'paddle'),
    });
    if (!paddleSettings || !paddleSettings.value) {
        return Environment.sandbox; // Default to sandbox
    }
    const paddleConfig = JSON.parse(paddleSettings.value as string);
    return paddleConfig.environment === 'production' ? Environment.production : Environment.sandbox;
}

export async function getPaddleClientToken(): Promise<string> {
  const paddleSettings = await db.query.settings.findFirst({
    where: eq(settingsTable.param, 'paddle'),
  });
  if (!paddleSettings || !paddleSettings.value) {
    throw new Error('Paddle client token not found in settings');
  }
  const paddleConfig = JSON.parse(paddleSettings.value as string);
  if (!paddleConfig.clientToken) {
    throw new Error('Paddle client token not found in settings');
  }
  return paddleConfig.clientToken;
}

export async function getPaddleProductId(): Promise<string | null> {
  const paddleSettings = await db.query.settings.findFirst({
    where: eq(settingsTable.param, 'paddle'),
  });
  if (!paddleSettings || !paddleSettings.value) {
    return null;
  }
  const paddleConfig = JSON.parse(paddleSettings.value as string);
  return paddleConfig.productId || null;
}

export async function updatePaddleProductId(productId: string): Promise<void> {
  const paddleSettings = await db.query.settings.findFirst({
    where: eq(settingsTable.param, 'paddle'),
  });

  let newSettings = {};
  if (paddleSettings && paddleSettings.value) {
    newSettings = JSON.parse(paddleSettings.value as string);
  }

  (newSettings as any).productId = productId;

  await db.insert(settingsTable).values({
    param: 'paddle',
    value: JSON.stringify(newSettings),
  }).onConflictDoUpdate({
    target: settingsTable.param,
    set: {
      value: JSON.stringify(newSettings),
    },
  });
}

let paddleInstance: Paddle | null = null;

export async function getPaddleInstance(): Promise<Paddle> {
    if (paddleInstance) {
        return paddleInstance;
    }

    const apiKey = await getPaddleApiKey();
    const environment = await getPaddleEnvironment();

    paddleInstance = new Paddle(apiKey, { environment });
    return paddleInstance;
}
