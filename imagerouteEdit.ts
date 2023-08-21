import express from 'express';
import File from '../../file';

// Query Parameters Structure to reference File and Size
interface ImageQuery {
  filename?: string;
  width?: string;
  height?: string;
}

const validate = async (query: ImageQuery): Promise<null | string> => {

  
  if (!(await File.isImageAvailable(query.filename))) {
    const availableImageNames: string = (
      await File.getAvailableImageNames()
    ).join('<br>');
    return `Please pass a valid filename in the 'filename' query parameter. <br><br> Considering the following available filenames:<br><br> ${availableImageNames}.`;
  }

  if (!query.width && !query.height) {
    return null; // Return the image at full size
  }

  // To check valid width value
  const width: number = parseInt(query.width || '');
  if (Number.isNaN(width) || width < 1) {
    return "Please provide a positive numerical value for the 'width' query parameter.";
  }

  // To check  valid height value
  const height: number = parseInt(query.height || '');

  if (Number.isNaN(height) || height < 1) {
    return "Please provide a positive numerical value for the 'height' query parameter.";
  }

  return null;
};

const images: express.Router = express.Router();

images.get(
  '/',
  async (
    request: express.Request,
    response: express.Response
  ): Promise<void> => {
    // Check whether request can be worked with
    const validationMessage: null | string = await validate(request.query);
    if (validationMessage) {
      response.send(validationMessage);
      return;
    }

    let error: null | string = '';

    // Create thumb if not yet created
    if (!(await File.isThumbAvailable(request.query))) {
      error = await File.createThumb(request.query);
    }

    // Handle image processing error
    if (error) {
      response.send(error);
      return;
    }

    // Retrieve appropriate image path and display image
    const path: null | string = await File.getImagePath(request.query);
    if (path) {
      response.sendFile(path);
    } else {
      response.send('This operation is not permited please check the parameters');
    }
  }
);

export default images;
