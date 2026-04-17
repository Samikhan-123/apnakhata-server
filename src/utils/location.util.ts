import axios from 'axios';
import { UAParser } from 'ua-parser-js';
import logger from './logger.js';

export interface LocationInfo {
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
  org?: string;
  hostname?: string;
  postal?: string;
  loc?: string;
  isLookupSuccessful?: boolean;
}

export interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  vendor?: string;
  model?: string;
  isMobile?: boolean;
}

/**
 * Fetch location information from an IP address
 * Uses ipinfo.io (HTTPS, Requires Token for higher limits)
 */
export const getLocationFromIp = async (ip: string): Promise<LocationInfo | null> => {
  // Handle localhost/private IPs
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
    return { city: 'Localhost', country: 'Dev Environment' };
  }

  try {
    const token = process.env.IPINFO_TOKEN;
    const url = `https://ipinfo.io/${ip}/json${token ? `?token=${token}` : ''}`;
    const response = await axios.get(url);
    
    // ipinfo.io returns data directly or throws on error
    return {
      isLookupSuccessful: true,
      city: response.data.city,
      country: response.data.country,
      region: response.data.region,
      timezone: response.data.timezone,
      org: response.data.org,
      hostname: response.data.hostname,
      postal: response.data.postal,
      loc: response.data.loc
    };
  } catch (error) {
    logger.error('Location lookup failed (ipinfo.io)', { ip, error });
    return { isLookupSuccessful: false };
  }
};

/**
 * Parse User Agent string into readable device info
 */
export const parseUserAgent = (uaString?: string): DeviceInfo => {
  if (!uaString || uaString === 'unknown') return { device: 'Unknown Device' };

  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const browserName = browser.name || 'Unknown Browser';
  const browserVersion = browser.version ? ` ${browser.version}` : '';
  
  const osName = os.name || 'Unknown OS';
  const osVersion = os.version ? ` ${os.version}` : '';

  const isMobile = device.type === 'mobile' || device.type === 'tablet';

  // Handle problematic single-letter models (like "K" for Kindle or truncated UA)
  let vendor = device.vendor;
  let model = device.model;

  if (vendor && vendor.length <= 1) vendor = undefined;
  if (model && model.length <= 1) model = undefined;

  return {
    browser: `${browserName}${browserVersion}`,
    os: `${osName}${osVersion}`,
    vendor,
    model: model || (isMobile ? 'Mobile Device' : undefined),
    device: model || device.type || (isMobile ? 'Mobile' : 'Desktop'),
    isMobile
  };
};

/**
 * Format Location and Device info into a single string for logging/emails
 */
export const formatTrackingInfo = (location: LocationInfo | null, device: DeviceInfo): string => {
  const locStr = location?.isLookupSuccessful ? `${location.city}, ${location.country}` : 'Unknown Location';
  
  const hardwareInfo = device.model 
    ? ` (${device.vendor ? `${device.vendor} ` : ''}${device.model})` 
    : (device.isMobile ? ' (Mobile Device)' : ' (Desktop)');

  const devStr = `${device.browser} on ${device.os}${hardwareInfo}`;
  return `${locStr} | ${devStr}`;
};
