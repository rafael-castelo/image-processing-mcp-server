#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { resizeImage, compressImage, convertImageFormat, batchImageProcessing, getImageMetadata, cropImage } from "./tools/index.js";
import { ResizeImageOptions, CompressImageOptions, ConvertImageFormatOptions, CropImageOptions } from "./types.js";

// Create server instance
const server = new McpServer({
  name: "image-processing",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {
      listChanged : true,
    },
  },
});

// Define Zod schemas for individual tool options
const ResizeImageOptionsSchema = z.object({
  imagePath: z.string().describe("Absolute path to the image file to be resized."),
  outputPath: z.string().describe("Absolute path to save the resized image."),
  width: z.number().optional().describe("Resulting width of the image"),
  height: z.number().optional().describe("Resulting height of the image"),
  keepAspectRatio: z.boolean().optional().describe("Whether to keep the original aspect ratio (default: false)"),
  quality: z.number().optional().describe("Compression quality (default: format standard, 1-100 for JPEG/WEBP, 0-9 for PNG)"),
});

const CompressImageOptionsSchema = z.object({
  imagePath: z.string().describe("Absolute path to the image file to be compressed."),
  outputPath: z.string().describe("Absolute path to save the compressed image."),
  quality: z.number().optional().describe("Controls the trade-off between file size and visual quality. For JPEG, WebP, and AVIF, higher values (e.g., 90-100) mean better quality and larger files, while lower values (e.g., 60-80) reduce file size but may introduce visible artifacts."),
  lossless: z.boolean().optional().describe(" If true, uses lossless compression when supported by the format (e.g., PNG, WebP, AVIF). Lossless compression preserves every detail of the original image but may not reduce file size as much as lossy compression. If set to false, lossy compression is used (if available), which can greatly reduce file size at the cost of some quality."),
});

const ConvertImageFormatOptionsSchema = z.object({
  imagePath: z.string().describe("Absolute path to the image file to be converted."),
  outputPath: z.string().describe("Absolute path to save the converted image."),
  format: z.enum(["jpeg", "jpg", "png", "webp", "avif", "tiff"]).describe("Desired output format (jpeg, jpg, png, webp, avif, tiff)"),
});

const GetImageMetadataSchema = z.object({
  imagePath: z.string().describe("Absolute path to the image file."),
});

const CropImageOptionsSchema = z.object({
  imagePath: z.string().describe("Absolute path to the image file to be cropped."),
  outputPath: z.string().describe("Absolute path to save the cropped image."),
  left: z.number().describe("The x-coordinate of the top-left corner of the area to be cropped, in pixels."),
  top: z.number().describe("The y-coordinate of the top-left corner of the area to be cropped, in pixels."),
  width: z.number().describe("The width of the area to be cropped, in pixels."),
  height: z.number().describe("The height of the area to be cropped, in pixels."),
});

server.tool(
  "resize-image",
  `Resize an image to a given width and height.
  \n The image file path must be provided.
  \n The resulting image will be saved to the given output path.
  \n All provided paths must be absolute file paths for the images to be resized.
  \n Optionally, you can keep the aspect ratio (default: false) and set compression quality (default: format standard).`,
  ResizeImageOptionsSchema.shape,
  async (resizeOptions: ResizeImageOptions) => {
    try {
      const resizedImagePath = await resizeImage(resizeOptions);
      return {
        content: [{
          type: "text",
          text: `Image resized and saved to ${resizedImagePath}`,
        }],
      };
    } catch (error) {
      console.error("Error resizing image:", error);
      throw error;
    }
  }
);

server.tool(
  "compress-image",
  `Compress an image while preserving as much quality as possible. The original format is always kept.
  \n\nHow to use:
  \n- For maximum quality and detail, set lossless: true (default) and omit quality.
  \n- For smaller file sizes, set lossless: false and adjust quality to a lower value (e.g., 80).
  \n- The LLM should choose lossless: true for graphics, logos, or archival, and lossless: false with a reasonable quality for web photos or when file size is a priority.
  \n- The tool will always keep the original format of the image.
  \n\nExamples:
  \n- Compress a photo for the web: set lossless: false, quality: 80.
  \n- Compress a logo for archival: set lossless: true.`,
  CompressImageOptionsSchema.shape,
  async (options : CompressImageOptions) => {
    try {
      const compressedImagePath = await compressImage(options);
      return {
        content: [{
          type: "text",
          text: `Image compressed and saved to ${compressedImagePath}`,
        }],
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  }
);


server.tool(
  "get-image-metadata",
  `Retrieves basic file information, dimensions, and technical details for a given image.
  
  The image file path must be provided.`,
  GetImageMetadataSchema.shape,
  async ({ imagePath }) => {
    try {
      const metadata = await getImageMetadata({ imagePath });
      
      return {
        content: [{
          type: "text",
          text: `Metadata for ${imagePath}: ${JSON.stringify(metadata, null, 2)}`,
        }],
        results: metadata,
      };
    } catch (error) {
      console.error("Error getting image metadata:", error);
      throw error;
    }
  }
);

server.tool(
  "convert-image-format",
  `Convert an image to another format without losing quality. The tool always uses lossless conversion if supported by the output format. Supported formats: jpeg, jpg, png, webp, avif, tiff.
  \n\nExamples:
  \n- Convert a PNG to WebP: set format to 'webp'.
  \n- Convert a JPEG to PNG: set format to 'png'.`,
  ConvertImageFormatOptionsSchema.shape,
  async (options : ConvertImageFormatOptions) => {
    try {
      const convertedImagePath = await convertImageFormat(options);
      return {
        content: [{
          type: "text",
          text: `Image converted and saved to ${convertedImagePath}`,
        }],
      };
    } catch (error) {
      console.error("Error converting image:", error);
      throw error;
    }
  }
);

server.tool(
  "crop-image",
  `Crop an image to a specified rectangular area.
  
  The image file path must be provided.
  
  The resulting image will be saved to the given output path.
  
  You must specify the top-left corner (left, top) and the dimensions (width, height) of the cropping area in pixels.`,
  CropImageOptionsSchema.shape,
  async (options : CropImageOptions) => {
    try {
      const croppedImagePath = await cropImage(options);
      return {
        content: [{
          type: "text",
          text: `Image cropped and saved to ${croppedImagePath}`,
        }],
      };
    } catch (error) {
      console.error("Error cropping image:", error);
      throw error;
    }
  }
);

server.tool(
  "batch-image-processing",
  `Run multiple image processing tasks (resize, compress, get metadata, crop image or convert format) in a single batch operation.
  \n  IMPORTANT: Always use this tool for tasks involving operations on more than one image.
  \n  This tool can be used to run any combination of the other existing image processing tools in a batch.
  \n  Specify an array of operations, where each operation includes the tool name and its specific options.
  

Examples:
  
1. Multiple operations:
  
{
    
  operations: [
    { toolName: 'resize-image', options: { imagePath: '...', outputPath: '...', height: 120 } },
    { toolName: 'compress-image', options: { imagePath: '...', outputPath: '...', quality: 80 } },
    { toolName: 'convert-image-format', options: { imagePath: '...', outputPath: '...', format: 'webp' } },
    { toolName: 'get-image-metadata', options: { imagePath: '...' } },
    { toolName: 'crop-image', options: { imagePath: '...', outputPath: '...', left: 10, top: 20, width: 100, height: 150 } }
    // ... more operations ...
  ]
  
}`,
  {
    operations: z.array(z.discriminatedUnion("toolName", [
      z.object({
        toolName: z.literal("resize-image"),
        options: ResizeImageOptionsSchema,
      }),
      z.object({
        toolName: z.literal("compress-image"),
        options: CompressImageOptionsSchema,
      }),
      z.object({
        toolName: z.literal("convert-image-format"),
        options: ConvertImageFormatOptionsSchema,
      }),
      z.object({
        toolName: z.literal("get-image-metadata"),
        options: GetImageMetadataSchema
      }),
      z.object({
        toolName: z.literal("crop-image"),
        options: CropImageOptionsSchema,
      })
    ])).describe("An array of image processing operations to perform."),
  },
  async ({ operations }) => {
    const results = await batchImageProcessing(operations);
    
    return {
      content: [{
        type: "text",
        text: `Batch processing results: ${JSON.stringify(results)}`,
      }],
      results,
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});