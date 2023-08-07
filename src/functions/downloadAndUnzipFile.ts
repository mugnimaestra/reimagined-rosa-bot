import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as fs from "fs";
import unzipper from "unzipper";

const downloadAndUnzipFile = async (
  url: string,
  outputPath: string
): Promise<string[]> => {
  try {
    const config: AxiosRequestConfig = {
      responseType: "arraybuffer",
    };

    // Download the file using axios
    const response: AxiosResponse = await axios.get(url, config);

    // Determine the file extension from the response's content type
    const contentType = response.headers["content-type"];
    const fileExtension = contentType === "application/zip" ? ".zip" : null;

    if (!fileExtension) {
      throw new Error("Unsupported file format.");
    }

    // Save the downloaded file
    fs.writeFileSync(
      outputPath + fileExtension,
      Buffer.from(response.data, "binary")
    );

    // Extract the downloaded file using unzipper for .zip files
    if (fileExtension === ".zip") {
      await fs
        .createReadStream(outputPath + fileExtension)
        .pipe(unzipper.Extract({ path: outputPath }))
        .promise();
    }

    // Delete the downloaded .zip or .rar file
    fs.unlinkSync(outputPath + fileExtension);

    // Get the list of filenames in the extracted directory
    const extractedFiles: string[] = await fs.promises.readdir(outputPath);

    console.log("Download and extraction complete!");
    return extractedFiles;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
};

export default downloadAndUnzipFile;

// // Replace the following URL with the link to your .zip or .rar file
// const fileUrl = 'https://getsamplefiles.com/download/rar/sample-3.rar';

// // Replace the following outputPath with the desired folder to save the unzipped contents
// const outputPath = 'extracted';

// // Call the function and handle the returned array of filenames
// downloadAndUnzipFile(fileUrl, outputPath)
//   .then((extractedFiles) => {
//     console.log('List of extracted files:');
//     console.log(extractedFiles);
//   })
//   .catch((error) => {
//     console.error('An error occurred:', error);
//   });
