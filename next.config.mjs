/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @huggingface/transformers ships ONNX/WASM binaries that must not be bundled;
    // ws + edge-tts break when webpack-bundled (bufferUtil.mask is not a function)
    serverComponentsExternalPackages: [
      "@huggingface/transformers",
      "ws",
      "@andresaya/edge-tts",
      "pdf-parse",
    ],
  },
};

export default nextConfig;
