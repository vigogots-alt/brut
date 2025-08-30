import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const AuthButtons: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешный выход",
        description: "Вы успешно вышли из системы.",
      });
      await refreshUser(); // Refresh user state after logout
      navigate("/login");
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex gap-2 mt-4">
      {user ? (
        <>
          <p className="text-muted-foreground self-center">Привет, {user.email}</p>
          <Button onClick={handleLogout} variant="outline">
            Выйти
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="outline">
            <Link to="/login">Войти</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Зарегистрироваться</Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default AuthButtons;