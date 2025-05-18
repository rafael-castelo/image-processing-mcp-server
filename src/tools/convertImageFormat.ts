import { ConvertImageFormatOptions } from "../types.js";
import sharp from "sharp";
import fs from "fs";
import { applySharpFormat } from "../utils/formatHelpers.js";

export const convertImageFormat = async (options: ConvertImageFormatOptions): Promise<string> => {
    const { imagePath, outputPath, format } = options;
  
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file does not exist: ${imagePath}`);
    }
  
    const imageBuffer = await fs.promises.readFile(imagePath);
    let sharpInstance = sharp(imageBuffer);
  
    // Always use lossless settings if possible
    let formatOptions: any = {};
    if (format === 'jpeg' || format === 'jpg') {
      formatOptions.quality = 100;
    } else if (format === 'png') {
      formatOptions.compressionLevel = 9;
    } else if (format === 'webp' || format === 'avif') {
      formatOptions.lossless = true;
    } else if (format === 'tiff') {
      formatOptions.compression = 'lzw';
    }
    sharpInstance = applySharpFormat(sharpInstance, format, formatOptions);
  
    const convertedBuffer = await sharpInstance.toBuffer();
    await fs.promises.writeFile(outputPath, convertedBuffer);
    return outputPath;
  };