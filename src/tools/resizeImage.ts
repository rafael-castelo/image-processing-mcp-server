import { ResizeImageOptions, ImageFormat } from "../types.js";
import sharp from "sharp";
import fs from "fs";
import { applySharpFormat } from "../utils/formatHelpers.js";

export const resizeImage = async ( options: ResizeImageOptions): Promise<string> => {
  const { imagePath, width, height, outputPath, keepAspectRatio = false, quality } = options;

  // Check if the image exists
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file does not exist: ${imagePath}`);
  }

  const imageBuffer = await fs.promises.readFile(imagePath);
  let sharpInstance = sharp(imageBuffer);

  const resizeOptions : sharp.ResizeOptions = { width, height };
  if (keepAspectRatio) {
    resizeOptions.fit = 'inside';
  }

  sharpInstance = sharpInstance.resize(resizeOptions);

  // Determine output format from outputPath extension
  const ext = outputPath.split('.').pop()?.toLowerCase() as ImageFormat;
  let formatOptions: any = {};

  if (quality && (ext === 'png' )) {
    formatOptions.compressionLevel = quality;
  } else if (quality) {
    formatOptions.quality = quality;
  }
  sharpInstance = applySharpFormat(sharpInstance, ext, formatOptions);

  const resizedBuffer = await sharpInstance.toBuffer();
  await fs.promises.writeFile(outputPath, resizedBuffer);
  return outputPath;
};