import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Converts an uploaded image to a webp image with optimized size and deletes the original file.
 * Returns the final filename of the processed webp file.
 */
export const processImageToWebp = async (file: Express.Multer.File): Promise<string> => {
    const originalPath = file.path;
    
    // 1. Secure file type validation
    if (!file.mimetype.startsWith('image/')) {
        try {
            if (fs.existsSync(originalPath)) {
                fs.unlinkSync(originalPath);
            }
        } catch (unlinkError) {
            console.error('[IMAGE_UTILS] Failed to delete invalid file type temp upload:', unlinkError);
        }
        throw new Error('Invalid file type: Only image uploads are allowed.');
    }

    const outputFilename = `${file.filename}.webp`;
    const outputPath = path.join('uploads', outputFilename);

    try {
        await sharp(originalPath)
            .resize(600) // Keep QR codes compact
            .webp({ quality: 85 })
            .toFile(outputPath);

        // Delete temporary upload
        fs.unlink(originalPath, (err) => {
            if (err) console.error('[IMAGE_UTILS] Failed to delete temporary file:', err);
        });

        return outputFilename;
    } catch (error) {
        console.error('[IMAGE_UTILS] Error processing image with sharp:', error);
        
        // Clean up temp file safely on failure
        try {
            if (fs.existsSync(originalPath)) {
                fs.unlinkSync(originalPath);
            }
        } catch (unlinkError) {
            console.error('[IMAGE_UTILS] Failed to delete temporary file during error cleanup:', unlinkError);
        }
        
        throw new Error('Failed to process uploaded image. Please ensure it is a valid image file.');
    }
};
