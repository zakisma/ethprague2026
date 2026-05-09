import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';

export default function AuthButton() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Укажи здесь порт, на котором крутится твой FastAPI (обычно 8000)
  const API_BASE = "http://localhost:8000";

  // При загрузке проверяем, есть ли уже сохраненный токен
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      // 1. ЗАПРОС NONCE: Отправляем wallet_address, чтобы получить сообщение для подписи
      const nonceRes = await fetch(`${API_BASE}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address })
      });
      
      if (!nonceRes.ok) throw new Error("Не удалось получить nonce от сервера");
      const { message } = await nonceRes.json();

      // 2. ПОДПИСЬ В METAMASK: Вызываем кошелек пользователя
      const signature = await signMessageAsync({ message });

      // 3. ВЕРИФИКАЦИЯ: Отправляем исходное сообщение и полученную подпись
      const verifyRes = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message, 
          signature: signature 
        })
      });

      if (!verifyRes.ok) throw new Error("Верификация подписи не удалась");
      
      // Достаем JWT токен из ответа
      const { access_token } = await verifyRes.json();

      // 4. СОХРАНЕНИЕ: Прячем токен в браузер и меняем интерфейс
      localStorage.setItem('access_token', access_token);
      setIsAuthenticated(true);
      console.log("Успешная авторизация! Токен сохранен.");

    } catch (error) {
      console.error("Ошибка авторизации:", error);
      alert("Ошибка входа. Проверь, запущен ли бэкенд на порту 8000 и нет ли ошибок CORS.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    disconnect(); // Опционально: отключаем сам кошелек в Wagmi
  };

  // Если кошелек не подключен через RainbowKit — прячем эту кнопку
  if (!isConnected) return null;

  // Если подключен, но не верифицирован на бэкенде
  if (!isAuthenticated) {
    return (
      <button 
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-emerald-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse disabled:opacity-50"
      >
        {isLoading ? "Verifying..." : "Verify Identity"}
      </button>
    );
  }

  // Если успешно залогинен
  return (
    <button 
      onClick={handleLogout}
      className="border border-rose-500/50 text-rose-400 px-4 py-2 rounded-lg font-bold hover:bg-rose-500/10 transition-all text-sm"
    >
      Sign Out
    </button>
  );
}