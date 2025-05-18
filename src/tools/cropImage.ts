import { ImageFormat, CropImageOptions } from "../types.js";
  import sharp from "sharp";
  import fs from "fs";
  import { applySharpFormat } from "../utils/formatHelpers.js";

export const cropImage = async (options: CropImageOptions): Promise<string> => {
    const { imagePath, outputPath, left, top, width, height } = options;
  
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file does not exist: ${imagePath}`);
    }
  
    const imageBuffer = await fs.promises.readFile(imagePath);
    let sharpInstance = sharp(imageBuffer);
  
    sharpInstance = sharpInstance.extract({ left, top, width, height });
  
    // Determine output format from outputPath extension
    const ext = outputPath.split('.').pop()?.toLowerCase() as ImageFormat;
    let formatOptions: any = {};
    // Note: For cropping, we generally want to preserve quality and format,
    // but applying format explicitly ensures correct output type.
    if (ext === 'png') {
      formatOptions.compressionLevel = 9; // Default to lossless for PNG
    } else if (ext === 'jpeg' || ext === 'jpg') {
      formatOptions.quality = 100; // Default to high quality for JPEG
    } else if (ext === 'webp' || ext === 'avif') {
       formatOptions.lossless = true; // Default to lossless
    } else if (ext === 'tiff') {
      formatOptions.compression = 'lzw'; // Default compression for TIFF
    }
  
    sharpInstance = applySharpFormat(sharpInstance, ext, formatOptions);
  
    const croppedBuffer = await sharpInstance.toBuffer();
    await fs.promises.writeFile(outputPath, croppedBuffer);
    return outputPath;
  };