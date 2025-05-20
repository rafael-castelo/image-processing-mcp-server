# Image Processing MCP server

## Description

This project serves as an MCP (Model Context Protocol) server, offering a suite of tools for common image processing tasks. It enables applications and services, such as Cursor and Claude, to easily perform operations like resizing, compressing, and converting image formats directly within your IDE, streamlining your workflow without needing to switch contexts.

## Example usage

**Resize images in bulk:**

Prompt:
```
Resize all images in `src/assets` folder to a height of 150px,
store the resulting images with the `_small` suffix
```

**Convert images format:**

Prompt:
```
Convert all images with the `.jpeg` extension located in the `/media` directory to the `webp` format.
Save the converted images in the same directory.
```

**Compress large images:**

Prompt:
```
Compress all images in the `/src/images` directory that have a file size larger than 10MB.
```

## Features

-   **Resize Images:** Adjust the dimensions of images.
-   **Compress Images:** Reduce file size with configurable quality and lossless options.
-   **Convert Image Format:** Change image files between various formats (JPEG, PNG, WebP, AVIF, TIFF).
-   **Get Image Metadata:** Retrieve technical details and information about image files.
-   **Crop Images:** Extract a specified rectangular area from an image.

## Installation

To set up the project locally, follow these steps:

1.  **Prerequisites:** Ensure you have Node.js (version 14 or higher recommended) and npm installed on your system.
2.  **Clone the Repository:**

    ```bash
    git clone git@github.com:rafael-castelo/image-processing-mcp-server.git
    cd image-processing-mcp
    ```

3.  **Install Dependencies:**

    ```bash
    npm install
    ```

4. **Build:**

    ```bash
    npm run build
    ```

    This will generate a build of the server and save it on ./build

## Usage


### Using from Cursor

Add or merge the following configuration to the `mcpServers` object:

NPX

```json
    {
        "mcpServers": {
        "image-processing": {
                "command": "npx",
                "args": [
                    "-y",
                    "image-processing-mcp-server"
                ]
            }
        }
    }
```

LOCAL

```json
    {
        "mcpServers": {
        "image-processing": {
                "command": "node",
                "args": [
                    "path/to/mcp/server/build/index.js"
                ]
            }
        }
    }
```

Once this configuration is in place and Cursor is running, it will automatically start the `image-processing` MCP server, making the tools available for use via tool calls in the chat or other Cursor features that interact with MCP.

## Tools Reference

This section details the image processing tools exposed by the MCP server, including their purpose and parameters.

### `resize-image`

**Description:** Resize an image to a given width and height.

**Parameters:**

*   `imagePath` (string, required): Absolute path to the image file to be resized.
*   `outputPath` (string, required): Absolute path to save the resized image.
*   `width` (number, optional): Resulting width of the image. Optional if height is provided.
*   `height` (number, optional): Resulting height of the image. Optional if width is provided.
*   `keepAspectRatio` (boolean, optional): Whether to keep the original aspect ratio (default: `false`).
*   `quality` (number, optional): Compression quality (default: format standard, 1-100 for JPEG/WEBP, 0-9 for PNG).

### `compress-image`

**Description:** Compress an image while preserving as much quality as possible. The original format is always kept.

**Parameters:**

*   `imagePath` (string, required): Absolute path to the image file to be compressed.
*   `outputPath` (string, required): Absolute path to save the compressed image.
*   `quality` (number, optional): Controls the trade-off between file size and visual quality. For JPEG, WebP, and AVIF, higher values (e.g., 90-100) mean better quality and larger files, while lower values (e.g., 60-80) reduce file size but may introduce visible artifacts.
*   `lossless` (boolean, optional): If `true`, uses lossless compression when supported by the format (e.g., PNG, WebP, AVIF). If `false`, lossy compression is used (default: `true`).

### `convert-image-format`

**Description:** Convert an image to another format without losing quality. The tool always uses lossless conversion if supported by the output format. Supported formats: jpeg, jpg, png, webp, avif, tiff.

**Parameters:**

*   `imagePath` (string, required): Absolute path to the image file to be converted.
*   `outputPath` (string, required): Absolute path to save the converted image.
*   `format` (string, required): Desired output format (jpeg, jpg, png, webp, avif, tiff).

### `get-image-metadata`

**Description:** Retrieves basic file information, including file size, format, dimensions in pixels (width and height), resolution, color space (e.g., sRGB, CMYK) and orientation details for a given image.

**Parameters:**

*   `imagePath` (string, required): Absolute path to the image file.

### `crop-image`

**Description:** Crop an image to a specified rectangular area.

**Parameters:**

*   `imagePath` (string, required): Absolute path to the image file to be cropped.
*   `outputPath` (string, required): Absolute path to save the cropped image.
*   `left` (number, required): The x-coordinate of the top-left corner of the area to be cropped, in pixels.
*   `top` (number, required): The y-coordinate of the top-left corner of the area to be cropped, in pixels.
*   `width` (number, required): The width of the area to be cropped, in pixels.
*   `height` (number, required): The height of the area to be cropped, in pixels.

### `batch-image-processing`

**Description:** Run multiple image processing tasks (resize, compress, get metadata, crop image or convert format) in a single batch operation. Always use this tool for tasks involving operations on more than one image.

**Parameters:**

*   `operations` (array of objects, required): An array of image processing operations to perform. Each object in the array should have two properties:
    *   `toolName` (string, required): The name of the tool to run (`resize-image`, `compress-image`, `convert-image-format`, `get-image-metadata`, or `crop-image`).
    *   `options` (object, required): An object containing the parameters specific to the tool specified in `toolName`. Refer to the individual tool descriptions for the required parameters.
