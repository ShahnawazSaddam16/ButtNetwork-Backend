const { pipeline } = require("@xenova/transformers");

let embedderInstance = null;

const getEmbedder = async () => {
  if (!embedderInstance) {
    embedderInstance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderInstance;
};

const generateEmbedding = async (text) => {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

module.exports = { generateEmbedding };