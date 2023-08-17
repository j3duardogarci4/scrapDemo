import { promises as fs } from 'fs';  
import path from 'path';
import processImage from './image-processing'; // to process size of image

// query parameters
interface QueryImageParameters {
  filename?: string;
  width?: string;
  height?: string;
}

export default class File {
  // Default paths
  static imagesFullPathAccess = path.resolve(__dirname, '../assets/images');
  static imagesThumbPathccess = path.resolve(__dirname, '../assets/images_thumb');

 
  static async getImagePath(params: QueryImageParameters): Promise<null | string> {
 
    if (!params.filename) {
      return null;
    }

    // to create the access url
    const fileImagePath: string =
      params.width && params.height
        ? path.resolve(
            File.imagesThumbPath,
            `${params.filename}-${params.width}x${params.height}.jpg`
          )
        : path.resolve(File.imagesFullPathAccess, `${params.filename}.jpg`);

    
    try {
      await fs.access(fileImagePath);
      return fileImagePath;
    } catch {
       console.log("Unable to open image selected...")
      return null;
    }
  }

  
  static async isImageAvailable(fileImagename: string = ''): Promise<boolean> {
    if (!fileImagename) {
      return false; 
    }

    return (await File.getAvailableImageNames()).includes(fileImagename);
  }

 
  static async getAvailableImageNames(): Promise<string[]> {
    try {
      return (await fs.readdir(File.imagesFullPathAccess)).map(
        (filename: string): string => filename.split('.')[0]
      ); // Cut extension
    } catch {
      return [];
    }
  }

  static async isThumbAvailable(params: ImageQuery): Promise<boolean> {
    if (!params.filename || !params.width || !params.height) {
      return false; 
    }


    const filePath: string = path.resolve(
      File.imagesThumbPath,
      `${params.filename}-${params.width}x${params.height}.jpg`
    );

    try {
      await fs.access(filePath);    
      return true;
    } catch {
      return false;
    }
  }

  static async createThumbPath(): Promise<void> {

    try {
      await fs.access(File.imagesThumbPath);
    } catch {      
      fs.mkdir(File.imagesThumbPath);
    }
  }

  
  static async createThumb(params: ImageQuery): Promise<null | string> {
    if (!params.filename || !params.width || !params.height) {
      return null; // null parameters no processing needed 
    }

    const filePathFull: string = path.resolve(
      File.imagesFullPathAccess,
      `${params.filename}.jpg`
    );
    const filePathThumb: string = path.resolve(
      File.imagesThumbPath,
      `${params.filename}-${params.width}x${params.height}.jpg`
    );

    console.log(`Creating thumb ${filePathThumb}`);    

    // Resize original image and store as thumb
    return await processImage({
      source: filePathFull,
      target: filePathThumb,
      width: parseInt(params.width),
      height: parseInt(params.height)
    });
  }
}
