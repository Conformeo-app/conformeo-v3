import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const VALID_APP_NAMES = new Set(["web", "mobile"]);
const VALID_APP_ENVS = new Set(["development", "staging", "production"]);

function parseDotenv(content) {
  const variables = {};
  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    variables[key] = value;
  }
  return variables;
}

async function readOptionalDotenv(filePath) {
  try {
    return parseDotenv(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

function normalizeAppEnv(value) {
  if (!value) {
    return "development";
  }
  if (!VALID_APP_ENVS.has(value)) {
    throw new Error(
      `CONFORMEO_APP_ENV invalide: "${value}". Valeurs attendues: development, staging, production.`
    );
  }
  return value;
}

function normalizeApiBaseUrl(value) {
  const resolved = value && value.length > 0 ? value : "http://localhost:8000";
  return resolved.replace(/\/+$/u, "");
}

async function generateFrontendEnv(appName) {
  if (!VALID_APP_NAMES.has(appName)) {
    throw new Error(`Application inconnue: "${appName}". Valeurs attendues: web, mobile.`);
  }

  const appDir = path.join(ROOT_DIR, "apps", appName);
  const baseEnv = await readOptionalDotenv(path.join(appDir, ".env"));
  const localEnv = await readOptionalDotenv(path.join(appDir, ".env.local"));
  const mergedEnv = {
    ...baseEnv,
    ...localEnv
  };

  const appEnv = normalizeAppEnv(mergedEnv.CONFORMEO_APP_ENV);
  const generatedEnv = {
    appEnv,
    apiBaseUrl: normalizeApiBaseUrl(mergedEnv.CONFORMEO_API_BASE_URL)
  };

  const outputDir = path.join(appDir, "src", "environments");
  const outputFile = path.join(outputDir, "generated-env.ts");
  const fileContent = `// Fichier généré par scripts/generate-frontend-env.mjs
// Ne pas éditer manuellement.

export type FrontendAppEnv = "development" | "staging" | "production";

export const generatedEnv = ${JSON.stringify(generatedEnv, null, 2)} as const;
`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, fileContent, "utf8");
  process.stdout.write(
    `[env] ${appName}: CONFORMEO_APP_ENV=${generatedEnv.appEnv}, CONFORMEO_API_BASE_URL=${generatedEnv.apiBaseUrl}\n`
  );
}

const appName = process.argv[2];

generateFrontendEnv(appName).catch((error) => {
  const message = error instanceof Error ? error.message : "Erreur inconnue.";
  process.stderr.write(`[env] ${message}\n`);
  process.exitCode = 1;
});
