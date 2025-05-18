import { GetImageMetadataOptions, ImageMetadataOutput } from "../types.js";
import sharp from "sharp";
import fs from "fs";

export const getImageMetadata = async ({ imagePath } : GetImageMetadataOptions): Promise<ImageMetadataOutput> => {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file does not exist: ${imagePath}`);
    }
  
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const stats = await fs.promises.stat(imagePath);
  
      // Map sharp metadata to the defined output schema
      return {
        filename: imagePath.split('/').pop() || '',
        path: imagePath,
        size: stats.size,
        format: metadata.format || '',
        width: metadata.width || 0,
        height: metadata.height || 0,
        resolution: metadata.density ? `${metadata.density} dpi` : undefined, // Sharp provides density, often used for resolution
        colorSpace: metadata.space,
        orientation: metadata.orientation,
      };
    } catch (error) {
      console.error("Error extracting metadata:", error);
      throw new Error(`Failed to extract metadata for ${imagePath}`);
    }
  };