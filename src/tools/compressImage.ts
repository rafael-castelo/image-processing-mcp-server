import { CompressImageOptions } from "../types.js";
import sharp from "sharp";
import fs from "fs";
import { applySharpFormat } from "../utils/formatHelpers.js";

export const compressImage = async (options: CompressImageOptions): Promise<string> => {
    const { imagePath, outputPath, quality, lossless = true } = options;
  
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file does not exist: ${imagePath}`);
    }
  
    const imageBuffer = await fs.promises.readFile(imagePath);
    let sharpInstance = sharp(imageBuffer);
  
    // Detect original format from input file extension
    const ext = imagePath.split('.').pop()?.toLowerCase() as 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'tiff';
    let formatOptions: any = {};
    if (ext === 'jpeg' || ext === 'jpg') {
      formatOptions.quality = quality ?? 95;
    } else if (ext === 'png') {
      formatOptions.compressionLevel = lossless ? 9 : 6;
    } else if (ext === 'webp' || ext === 'avif') {
      formatOptions.quality = quality ?? 95;
      formatOptions.lossless = lossless;
    } else if (ext === 'tiff') {
      formatOptions.compression = 'lzw';
    }
    sharpInstance = applySharpFormat(sharpInstance, ext, formatOptions);
  
    const compressedBuffer = await sharpInstance.toBuffer();
    await fs.promises.writeFile(outputPath, compressedBuffer);
    return outputPath;
  };