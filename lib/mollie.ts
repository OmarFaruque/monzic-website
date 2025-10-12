import { createMollieClient, MollieClient } from "@mollie/api-client";
import { db } from "@/lib/db";
import { settings as settingsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getMollieApiKey(): Promise<string> {
  const mollieSettings = await db.query.settings.findFirst({
    where: eq(settingsTable.param, 'mollie'),
  });
  if (!mollieSettings || !mollieSettings.value) {
    throw new Error('Mollie API key not found in settings');
  }
  const mollieConfig = JSON.parse(mollieSettings.value as string);
  return mollieConfig.apiKey;
}

export async function getMollieClient(): Promise<MollieClient> {
    const apiKey = await getMollieApiKey();
    return createMollieClient({ apiKey });
}
