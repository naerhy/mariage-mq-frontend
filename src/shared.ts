import { isAxiosError } from "axios";

export interface AuthInfo {
  role: "admin" | "user";
  token: string;
}

export type NotificationType = "success" | "error";

export interface Photo {
  id: number;
  name: string;
  timestamp: string; // bigint cannot be stored in number
  url: string;
  thumbnailURL: string;
  source: string;
  subjects: string[];
}

export const baseURL = "https://naerhy.ovh/mnemosyne";
export const staticBaseURL = "https://naerhy.ovh/static/mnemosyne";

export const sources = ["Patrick", "Photobooth", "Photographe", "Toutes", "WhatsApp", "Xialing"];

export const subjects = [
  "Anne.D",
  "Anne.S",
  "Benjamin",
  "Bertrand",
  "Camille",
  "Chloé",
  "Corentin",
  "Divers",
  "Dylan",
  "Georges",
  "Hervé",
  "Laetitia",
  "Magali",
  "Mamée",
  "Maxime",
  "Martine",
  "Noémie",
  "Quentin",
  "Patrick",
  "Sylvie",
  "Thierry",
  "Véronique",
  "Xialing"
];

export function getErrorMessage(err: unknown): string {
  if (isAxiosError(err) && err.response?.data.message) {
    return err.response.data.message;
  } else {
    return err instanceof Error ? err.message : "Unexpected error";
  }
}
