import { createClient } from '@supabase/supabase-js';
import { Readable } from "stream";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import formidable from "formidable";
import fs from 'fs/promises'; // Для чтения временного файла

// Инициализируем клиент Supabase для Netlify функции
// Используем process.env, так как это серверная среда
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Или SUPABASE_SERVICE_ROLE_KEY для более привилегированных операций

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is not set in Netlify environment variables.");
  // Функция, вероятно, завершится ошибкой, если ключи отсутствуют.
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // Используем non-null assertion, так как мы проверили выше

// Вспомогательная функция для парсинга multipart/form-data
const parseMultipartForm = async (event: HandlerEvent) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: true });

      const bodyBuffer = event.isBase64Encoded
        ? Buffer.from(event.body || "", "base64")
        : Buffer.from(event.body || "", "utf8");

      const mockRequest = new Readable();
      mockRequest.headers = event.headers;
      mockRequest.push(bodyBuffer);
      mockRequest.push(null);

      form.parse(mockRequest, (err, fields, files) => {
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

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    console.log("Received file in Netlify Function:", uploadedFile.originalFilename);
    console.log("File path (temp):", uploadedFile.filepath);
    console.log("File size:", uploadedFile.size);
    console.log("File type:", uploadedFile.mimetype);

    // Читаем содержимое файла из временного пути
    const fileContent = await fs.readFile(uploadedFile.filepath);

    // Определяем путь в Supabase Storage
    // Для простоты используем оригинальное имя файла с временной меткой для избежания коллизий
    const timestamp = Date.now();
    const storagePath = `uploads/${timestamp}-${uploadedFile.originalFilename}`;

    const { data, error: uploadError } = await supabase.storage
      .from('uploads') // Убедитесь, что у вас есть бакет с именем 'uploads' в Supabase
      .upload(storagePath, fileContent, {
        contentType: uploadedFile.mimetype || 'application/octet-stream',
        upsert: false, // Не перезаписывать существующие файлы
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to upload file to storage", error: uploadError.message }),
      };
    }

    console.log(`File '${uploadedFile.originalFilename}' uploaded to Supabase Storage at: ${data?.path}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File successfully uploaded to storage",
        filename: uploadedFile.originalFilename,
        size: uploadedFile.size,
        supabasePath: data?.path,
      }),
    };
  } catch (error: any) {
    console.error("Error in Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to process file upload", error: error.message }),
    };
  }
};

export { handler };