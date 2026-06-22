import config from "@payload-config";
import { getPayload } from "payload";

/** Instance Payload partagée (mise en cache par le module payload). */
export async function getPayloadClient() {
  const payloadConfig = await config;
  return getPayload({ config: payloadConfig });
}
