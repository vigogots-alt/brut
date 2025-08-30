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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadProgress(0); // Reset progress when a new file is selected
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
          description: "Файл успешно загружен!",
        });
        setSelectedFile(null); // Clear selected file after successful upload
      } else {
        toast({
          title: "Ошибка загрузки",
          description: `Произошла ошибка при загрузке файла: ${xhr.statusText}`,
          variant: "destructive",
        });
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Ошибка сети",
        description: "Не удалось подключиться к серверу.",
        variant: "destructive",
      });
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
          disabled={isUploading}
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
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? "Загрузка..." : "Загрузить файл"}
      </Button>
    </div>
  );
};

export default FileUpload;