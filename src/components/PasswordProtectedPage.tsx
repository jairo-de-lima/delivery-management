import { LogOut } from "lucide-react";
import React, { useState } from "react";

interface PasswordProtectedPageProps {
  correctPassword: string;
  children: React.ReactNode;
}

const PasswordProtectedPage: React.FC<PasswordProtectedPageProps> = ({
  correctPassword,
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem("isAuthenticated");
    return saved === "true";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Função para verificar a força da senha
  const getPasswordStrength = (pass: string) => {
    let score = 0;

    // Comprimento mínimo
    if (pass.length >= 8) score += 1;

    // Contém números
    if (/\d/.test(pass)) score += 1;

    // Contém letras minúsculas
    if (/[a-z]/.test(pass)) score += 1;

    // Contém letras maiúsculas
    if (/[A-Z]/.test(pass)) score += 1;

    // Contém caracteres especiais
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

    return score;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      setError("");
      setPassword("");
    } else {
      setError("Senha incorreta");
      // Vibrar o campo de senha
      const input = document.getElementById("password-input");
      input?.classList.add("animate-shake");
      setTimeout(() => {
        input?.classList.remove("animate-shake");
      }, 500);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  // Adiciona classe de animação para shake
  const shakeKeyframes = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <style>{shakeKeyframes}</style>
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Área Restrita</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                    focus:border-blue-500 focus:ring-blue-500 p-2 pr-10
                    ${error ? "border-red-500" : ""}
                    [&.animate-shake] {
                      animation: shake 0.5s ease-in-out;
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Indicador de força da senha digitada */}
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-full rounded ${
                      index < getPasswordStrength(password)
                        ? [
                            "bg-red-500",
                            "bg-orange-500",
                            "bg-yellow-500",
                            "bg-lime-500",
                            "bg-green-500",
                          ][index]
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500">
                Força da senha:{" "}
                {["Muito fraca", "Fraca", "Média", "Forte", "Muito forte"][
                  getPasswordStrength(password) - 1
                ] || "Digite sua senha"}
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600 transition-colors"
            >
              Entrar
            </button>
          </form>

          {/* <div className="mt-4 text-xs text-gray-500">
            <p>A senha deve conter:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li className={password.length >= 8 ? 'text-green-500' : ''}>
                Mínimo de 8 caracteres
              </li>
              <li className={/\d/.test(password) ? 'text-green-500' : ''}>
                Números
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>
                Letras minúsculas
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
                Letras maiúsculas
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : ''}>
                Caracteres especiais
              </li>
            </ul>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="top-4 right-4 flex justify-end absolute">
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
      {children}
    </div>
  );
};

export default PasswordProtectedPage;
