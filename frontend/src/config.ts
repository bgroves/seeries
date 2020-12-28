import dotenv from 'dotenv';
dotenv.config();

function envOrDefault(key: string, defaultValue: string): string {
  const envValue = process.env[key];
  return envValue == null ? defaultValue : envValue;
}

const config = {
  apiUrl: envOrDefault('API_URL', 'http://localhost:8000/'),
  apiTimeout: envOrDefault('API_TIMEOUT', '5000'),
  graphChunkSize: envOrDefault('GRAPH_CHUNK_SIZE', '86400000'),
};

export default config;
