import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import formidable from "formidable";
import fs from "fs";

// Helper to parse multipart/form-data
const parseMultipartForm = async (event: HandlerEvent) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: true });

      form.parse(event.body || "", (err, fields, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ fields, files });
      });
    },
  );
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { files } = await parseMultipartForm(event);

    if (!files.file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No file uploaded" }),
      };
    }

    // formidable returns an array for files, even if it's a single file
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    console.log("Received file:", uploadedFile.originalFilename);
    console.log("File path:", uploadedFile.filepath);
    console.log("File size:", uploadedFile.size);
    console.log("File type:", uploadedFile.mimetype);

    // You can now process the file, e.g., save it to a storage,
    // or send it to a backend worker as planned.
    // For now, we'll just acknowledge receipt.

    // If you need to read the file content:
    // const fileContent = fs.readFileSync(uploadedFile.filepath);
    // console.log("File content snippet:", fileContent.toString('utf8', 0, 100));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File uploaded successfully",
        filename: uploadedFile.originalFilename,
        size: uploadedFile.size,
      }),
    };
  } catch (error) {
    console.error("Error parsing form data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to upload file", error: error.message }),
    };
  }
};

export { handler };