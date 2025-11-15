import { pipeline } from "@xenova/transformers";

// 全局只初始化一次
let extractor = null;

export async function extractKeywords(file) {
  if (!extractor) {
    console.log("Loading CLIP pipeline from CDN...");
    // 直接用 Xenova 提供的模型名，浏览器会自动下载模型
    extractor = await pipeline(
      "zero-shot-image-classification",
      "Xenova/clip-vit-base-patch32"
    );
    console.log("CLIP loaded:", extractor);
  }

  const candidates = [
    "nature","mountain","forest","city","cat","dog","sunset",
    "sky","person","portrait","car","flower","tree","landscape",
    "building","street","ocean","night","art","minimalism"
  ];

  // 传入 File 或 Blob 对象
  const result = await extractor(file, candidates);

  // 返回 top 2~3 个关键词
  return result
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.label);
}
