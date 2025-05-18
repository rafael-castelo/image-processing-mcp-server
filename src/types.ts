type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'tiff';
interface ResizeImageOptions {
  imagePath: string;
  outputPath: string;
  width?: number;
  height?: number;
  keepAspectRatio?: boolean;
  quality?: number;
}
interface CompressImageOptions {
  imagePath: string;
  outputPath: string;
  quality?: number;
  lossless?: boolean; // default true
}

interface ConvertImageFormatOptions {
  imagePath: string;
  outputPath: string;
  format: ImageFormat;
}

interface GetImageMetadataOptions {
  imagePath : string
}

interface CropImageOptions {
  imagePath: string;
  outputPath: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

type ToolName = 'resize-image' | 'compress-image' | 'convert-image-format' | 'get-image-metadata' | 'crop-image'

type ToolOptions =  CompressImageOptions | ResizeImageOptions | ConvertImageFormatOptions | GetImageMetadataOptions | CropImageOptions

type BatchToolOptions = {
  toolName : ToolName,
  options : ToolOptions
}

interface ImageMetadataOutput {
  filename: string;
  path: string;
  /** File size in bytes. */
  size: number;
  /** Image format (e.g., png, jpeg). */
  format: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels. */
  height: number;
  /** Image resolution (e.g., DPI) */
  resolution?: string;
  /** Image color space (e.g., sRGB, CMYK). */
  colorSpace?: string;
  /** Image orientation (EXIF tag). */
  orientation?: number;
}

export { ImageFormat, ToolName, ToolOptions, BatchToolOptions, ResizeImageOptions, CompressImageOptions, ConvertImageFormatOptions, GetImageMetadataOptions, CropImageOptions, ImageMetadataOutput };