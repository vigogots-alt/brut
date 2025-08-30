import { Readable } from "stream"; // Импортируем Readable для создания потока
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import formidable from "formidable";

// Helper to parse multipart/form-data
const parseMultipartForm = async (event: HandlerEvent) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: true });

      // formidable ожидает, что тело будет строкой или буфером, а не в кодировке base64.
      // Netlify Functions предоставляют event.body в кодировке base64, если event.isBase64Encoded равно true.
      const bodyBuffer = event.isBase64Encoded
        ? Buffer.from(event.body || "", "base64")
        : Buffer.from(event.body || "", "utf8"); // Убедимся, что это буфер

      // Создаем моковый объект запроса, который реализует достаточно http.IncomingMessage
      // для работы formidable. Ему нужны 'headers' и он должен быть Readable потоком.
      const mockRequest = new Readable();
      mockRequest.headers = event.headers; // Прикрепляем заголовки
      mockRequest.push(bodyBuffer); // Передаем содержимое тела
      mockRequest.push(null); // Сигнализируем об окончании потока

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

    // Имитация пересылки на бэкенд-воркер
    console.log(`[SIMULATION] File '${uploadedFile.originalFilename}' forwarded to backend worker for credential verification.`);

    // В реальном сценарии вы бы отправили этот файл (или ссылку/метаданные)
    // вашему долгосрочному бэкенд-воркеру, возможно, через очередь сообщений (например, SQS, RabbitMQ)
    // или прямой вызов API к постоянному сервису.

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File accepted for processing",
        filename: uploadedFile.originalFilename,
        size: uploadedFile.size,
      }),
    };
  } catch (error) {
    console.error("Error in Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to process file upload", error: error.message }),
    };
  }
};

export { handler };