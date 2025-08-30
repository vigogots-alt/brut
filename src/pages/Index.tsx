import { MadeWithDyad } from "@/components/made-with-dyad";
import FileUpload from "@/components/FileUpload";
import AuthButtons from "@/components/AuthButtons";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const Index = () => {
  const { user } = useAuth(); // Get user from AuthContext

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Добро пожаловать в ваше приложение
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Начните создавать свой удивительный проект здесь!
        </p>
      </div>
      <AuthButtons />
      {user && <FileUpload />} {/* Render FileUpload only if user is logged in */}
      <MadeWithDyad />
    </div>
  );
};

export default Index;