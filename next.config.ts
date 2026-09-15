import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que o Turbopack suba até um package-lock.json de um diretório
  // ancestral (fora deste projeto) ao detectar a raiz do workspace.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
