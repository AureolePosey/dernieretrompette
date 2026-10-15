import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env, hasCloudinary, isProduction } from "@/lib/env";

/**
 * Stockage des images.
 *
 * Deux pilotes derrière une seule interface :
 *   - LOCAL      : écrit dans public/uploads. Sert au développement, sans
 *                  compte tiers à créer pour lancer le projet.
 *   - CLOUDINARY : utilisé dès que les clés sont présentes. Obligatoire en
 *                  production, car le système de fichiers d'une fonction
 *                  serverless est en lecture seule et éphémère.
 *
 * L'appel à Cloudinary se fait par son API REST signée, sans SDK : une trentaine
 * de lignes contre une dépendance de plusieurs mégaoctets qui n'apporterait rien
 * de plus ici.
 */

/** Types réellement acceptés. Le champ MIME du navigateur n'est pas digne de confiance. */
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo

/**
 * Signatures binaires (magic bytes) des formats autorisés.
 * Un attaquant peut déclarer « image/png » sur un script : on vérifie donc le
 * contenu réel du fichier, pas son étiquette.
 */
function detectImageType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  // Conteneur RIFF/WEBP : "RIFF" .... "WEBP"
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }

  // Conteneur ISO-BMFF : "ftyp" en position 4, marque "avif"/"avis"
  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "image/avif";
  }

  return null;
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

function validate(file: File, buffer: Buffer): string | null {
  if (file.size === 0) return "Le fichier est vide.";
  if (file.size > MAX_BYTES) return "L'image ne doit pas dépasser 5 Mo.";

  const detected = detectImageType(buffer);
  if (!detected) {
    return "Format non reconnu. Formats acceptés : JPEG, PNG, WebP, AVIF.";
  }
  if (!ALLOWED_MIME.includes(detected as (typeof ALLOWED_MIME)[number])) {
    return "Format non autorisé. Formats acceptés : JPEG, PNG, WebP, AVIF.";
  }
  return null;
}

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "avif";
  }
}

async function uploadToCloudinary(buffer: Buffer, mime: string): Promise<UploadResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "laderniere-trompette";

  // Cloudinary impose une signature SHA-1 des paramètres triés par nom.
  const toSign = `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mime }));
  form.append("api_key", env.CLOUDINARY_API_KEY!);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    // Le détail de l'erreur reste dans les logs : il peut contenir des éléments
    // de configuration qui n'ont rien à faire dans une interface utilisateur.
    console.error("Cloudinary upload failed", response.status, await response.text());
    return { ok: false, error: "L'envoi de l'image a échoué. Réessayez dans un instant." };
  }

  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) {
    return { ok: false, error: "Réponse inattendue du service d'images." };
  }

  return { ok: true, url: data.secure_url };
}

async function uploadToLocalDisk(buffer: Buffer, mime: string): Promise<UploadResult> {
  if (isProduction) {
    return {
      ok: false,
      error:
        "Aucun stockage d'images configuré. Renseignez les variables CLOUDINARY_* " +
        "en production : le disque local y est en lecture seule.",
    };
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(directory, { recursive: true });

  // Nom aléatoire : le nom d'origine est contrôlé par l'utilisateur et pourrait
  // servir à une traversée de répertoire ou à écraser un fichier existant.
  const filename = `${crypto.randomUUID()}.${extensionFor(mime)}`;
  await fs.writeFile(path.join(directory, filename), buffer);

  return { ok: true, url: `/uploads/${filename}` };
}

/** Point d'entrée unique : valide puis délègue au pilote disponible. */
export async function uploadImage(file: File): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const error = validate(file, buffer);
  if (error) return { ok: false, error };

  const mime = detectImageType(buffer)!;

  try {
    return hasCloudinary
      ? await uploadToCloudinary(buffer, mime)
      : await uploadToLocalDisk(buffer, mime);
  } catch (cause) {
    console.error("Image upload failed", cause);
    return { ok: false, error: "L'envoi de l'image a échoué. Réessayez dans un instant." };
  }
}
