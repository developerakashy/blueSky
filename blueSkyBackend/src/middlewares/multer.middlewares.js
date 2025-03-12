import multer from 'multer'; // Multer is a middleware for handling file uploads
import path from 'path'; // Path module for working with file and directory paths

// Configure storage for file uploads
const storage = multer.diskStorage({
  // Set the destination folder where uploaded files will be stored
  destination: (req, file, cb) => {
    cb(null, path.resolve("./public/temp")); // Store files in the './public/temp' directory
  },
  // Set the filename format for uploaded files
  filename: (req, file, cb) => {
    // Create a unique file name using the current timestamp and the original file name
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename); // Pass the unique filename to the callback
  }
});

// Initialize the multer upload middleware with the storage configuration
const upload = multer({
  storage: storage // Use the defined storage configuration
});

// Export the upload middleware for use in other modules
export { upload };
