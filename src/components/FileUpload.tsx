import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessingBackend, setIsProcessingBackend] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadProgress(0); // Сброс прогресса при выборе нового файла
      setIsProcessingBackend(false); // Сброс состояния обработки
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите файл для загрузки.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setIsProcessingBackend(false); // Убедимся, что это false в начале загрузки
    const formData = new FormData();
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(percentCompleted);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        toast({
          title: "Успех",
          description: "Файл принят, ожидайте обработки.",
        });
        setIsProcessingBackend(true); // Устанавливаем состояние обработки
        // Мы не очищаем selectedFile здесь, так как он теперь "обрабатывается"
      } else {
        toast({
          title: "Ошибка загрузки",
          description: `Произошла ошибка при загрузке файла: ${xhr.statusText}`,
          variant: "destructive",
        });
        setSelectedFile(null); // Очищаем при ошибке
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Ошибка сети",
        description: "Не удалось подключиться к серверу.",
        variant: "destructive",
      });
      setSelectedFile(null); // Очищаем при ошибке
    };

    xhr.open("POST", "/.netlify/functions/upload", true);
    xhr.send(formData);
  };

  return (
    <div className="w-full max-w-md p-6 border rounded-lg shadow-md bg-card text-card-foreground">
      <h2 className="text-2xl font-bold mb-4 text-center">Загрузка файла</h2>
      <div className="grid w-full items-center gap-1.5 mb-4">
        <Label htmlFor="file-upload">Выберите файл</Label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={isUploading || isProcessingBackend}
          className="cursor-pointer"
        />
        {selectedFile && (
          <p className="text-sm text-muted-foreground mt-2">
            Выбран файл: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}
      </div>
      {isUploading && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Загрузка: {uploadProgress}%
          </p>
        </div>
      )}
      {isProcessingBackend && !isUploading && (
        <div className="mb-4 text-center text-blue-600 dark:text-blue-400">
          <p className="text-sm">
            Файл принят. Ожидайте обработки на бэкенде...
          </p>
        </div>
      )}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading || isProcessingBackend}
        className="w-full"
      >
        {isUploading ? "Загрузка..." : isProcessingBackend ? "Ожидание обработки..." : "Загрузить файл"}
      </Button>
    </div>
  );
};

export default FileUpload;