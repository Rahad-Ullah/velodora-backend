import { SystemService } from "../app/modules/system/system.service";

async function rsdToCredits(rsd: number): Promise<number> {
  const system = await SystemService.getSystemFromDB()
  return rsd * system?.data?.oneRsdToCredits;
}

async function creditsToRsd(credits: number): Promise<number> {
  const system = await SystemService.getSystemFromDB()
  return credits / system?.data?.oneRsdToCredits;
}

export const RsdCreditsTransformation = { rsdToCredits, creditsToRsd };