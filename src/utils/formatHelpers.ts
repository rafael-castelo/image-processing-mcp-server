import sharp from "sharp";

export function applySharpFormat(
  sharpInstance: sharp.Sharp,
  format: 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'tiff',
  options: sharp.JpegOptions | sharp.PngOptions | sharp.WebpOptions | sharp.AvifOptions | sharp.TiffOptions
): sharp.Sharp {
  switch (format) {
    case 'jpeg':
    case 'jpg':
      return sharpInstance.jpeg(options as sharp.JpegOptions);
    case 'png':
      return sharpInstance.png(options as sharp.PngOptions);
    case 'webp':
      return sharpInstance.webp(options as sharp.WebpOptions);
    case 'avif':
      return sharpInstance.avif(options as sharp.AvifOptions);
    case 'tiff':
      return sharpInstance.tiff(options as sharp.TiffOptions);
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
} 