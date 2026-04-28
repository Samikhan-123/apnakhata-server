import axios from "axios";
import { UAParser } from "ua-parser-js";
import crypto from "crypto";
import { Request } from "express";
import logger from "./logger.js";

export interface LocationInfo {
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
  org?: string;
  hostname?: string;
  postal?: string;
  loc?: string;
  isLookupSuccessful: boolean;
}

export interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  vendor?: string;
  model?: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  isMobile: boolean;
}

// In-memory cache for IP lookups with 60-minute TTL
interface CacheEntry {
  data: LocationInfo;
  timestamp: number;
}
const ipCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes in ms

/**
 * Reliably extract the client's IP address, handling proxies and CDNs
 */
export const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
};

/**
 * Check if an IP address is private/local
 */
export const isPrivateIp = (ip: string): boolean => {
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
};

/**
 * Hash an IP address for privacy-safe logging
 */
export const hashIp = (ip: string): string => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};

/**
 * Fetch location information from an IP address
 * Uses ipinfo.io with caching and timeouts
 */
export const getLocationFromIp = async (
  ip: string,
): Promise<LocationInfo | null> => {
  // 1. Handle localhost/private IPs
  if (isPrivateIp(ip)) {
    return { city: "Localhost", country: "Dev Env", isLookupSuccessful: true };
  }

  // 2. Check Cache with TTL
  const cached = ipCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const token = process.env.IPINFO_TOKEN;
    const url = `https://ipinfo.io/${ip}/json${token ? `?token=${token}` : ""}`;

    const response = await axios.get(url, {
      timeout: 2000, // 2 second timeout to prevent blocking
    });

    const data: LocationInfo = {
      isLookupSuccessful: true,
      city: response.data.city,
      country: response.data.country,
      region: response.data.region,
      timezone: response.data.timezone,
      org: response.data.org,
      hostname: response.data.hostname,
      postal: response.data.postal,
      loc: response.data.loc,
    };

    // Store in Cache with timestamp
    ipCache.set(ip, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    logger.error("Location lookup failed (ipinfo.io)", {
      ipHash: hashIp(ip),
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { isLookupSuccessful: false };
  }
};

/**
 * Parse User Agent string into readable device info
 */
export const parseUserAgent = (uaString?: string): DeviceInfo => {
  if (!uaString || uaString === "unknown") {
    return {
      device: "Unknown Device",
      isMobile: false,
      deviceType: "unknown",
    };
  }

  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const browserName = browser.name || "Unknown Browser";
  const browserVersion = browser.version ? ` ${browser.version}` : "";

  const osName = os.name || "Unknown OS";
  const osVersion = os.version ? ` ${os.version}` : "";

  const isMobile = device.type === "mobile" || device.type === "tablet";

  const vendor = device.vendor;
  const model = device.model;

  return {
    browser: `${browserName}${browserVersion}`,
    os: `${osName}${osVersion}`,
    vendor,
    model: model || (isMobile ? "Mobile Device" : undefined),
    device: model || device.type || (isMobile ? "Mobile" : "Desktop"),
    deviceType: (device.type as any) || (isMobile ? "mobile" : "desktop"),
    isMobile,
  };
};

/**
 * Format Location and Device info into a single string for logging/emails
 */
export const formatTrackingInfo = (
  location: LocationInfo | null,
  device: DeviceInfo,
): string => {
  const locStr = location?.isLookupSuccessful
    ? [location.city, location.country].filter(Boolean).join(", ")
    : "Unknown Location";

  const hardwareInfo = device.model
    ? ` (${device.vendor ? `${device.vendor} ` : ""}${device.model})`
    : ` (${capitalize(device.deviceType)})`;

  const devStr = `${device.browser} on ${device.os}${hardwareInfo}`;
  return `${locStr} | ${devStr}`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
