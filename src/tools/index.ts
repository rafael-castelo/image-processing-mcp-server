import { BatchToolOptions, ResizeImageOptions, CompressImageOptions, ConvertImageFormatOptions, GetImageMetadataOptions, CropImageOptions } from "../types.js";
import { compressImage } from "./compressImage.js";
import { resizeImage } from "./resizeImage.js";
import { convertImageFormat } from "./convertImageFormat.js";
import { getImageMetadata } from "./getImageMetadata.js";
import { cropImage } from "./cropImage.js";

const batchImageProcessing = async ( batchToolOptions : BatchToolOptions[] ) => {
    const results = await Promise.all(batchToolOptions.map(async ( {toolName, options} , index) => {
      try {
        let result;
        if (toolName === 'resize-image') {
          result = await resizeImage(options as ResizeImageOptions);
        } else if (toolName === 'compress-image') {
          result = await compressImage(options as CompressImageOptions);
        } else if (toolName === 'convert-image-format') {
          result = await convertImageFormat(options as ConvertImageFormatOptions);
        } else if (toolName === 'get-image-metadata') {
          result = await getImageMetadata(options as GetImageMetadataOptions);
        } else if (toolName === 'crop-image') {
          result = await cropImage(options as CropImageOptions);
        } else {
          throw new Error(`Unknown tool: ${toolName}`);
        }
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error), index };
      }
    }));
    return results;
  }

export { batchImageProcessing, resizeImage, compressImage, convertImageFormat, getImageMetadata, cropImage };