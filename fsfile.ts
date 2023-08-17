import { promises as fs } from 'fs';  
import path from 'path';
import processImage from './image-processing'; // to process size of image


interface QueryImageParameters {
  filename?: string;
  width?: string;
  height?: string;
}

export default class File {

  static imagesFullPathAccess = path.resolve(__dirname, '../assets/images');
  static imagesThumbPathccess = path.resolve(__dirname, '../assets/images_thumb');

  static async getImagePath(params: QueryImageParameters): Promise<null | string> {
 
    if (params.filename) {
           const fileImagePath: string = params.width && params.height ? path.resolve(
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
    } else {
           return null;   
   }

    
  static async isImageAvailable(fileImagename: string = ''): Promise<boolean> {
    if (fileImagename) {
      result = (await File.getAvailableImageNames()).includes(fileImagename); 
    } else {
      result = false; 
    }    
    return result
   }

 
  static async getAvailableImageNames(): Promise<string[]> {
    try {
      result = (await fs.readdir(File.imagesFullPathAccess)).map(
                           (filename: string): string => filename.split('.')[0]
                          ); // Cut extension
    } catch {
      result = [];
    }
    return result;
  }

  static async isThumbAvailable(params: ImageQuery): Promise<boolean> {
    if (params.filename || params.width || params.height) {
       const filePath: string = path.resolve(
                                         File.imagesThumbPath,
                                         `${params.filename}-${params.width}x${params.height}.jpg`
                                        );
       try {
            await fs.access(filePath);    
            result = true;
           } catch {
            result = false;
           }

    } else{
      return false;
    }   
    return result;
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
