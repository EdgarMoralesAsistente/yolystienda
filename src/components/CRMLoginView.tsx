import React, { useState } from 'react';
import { ArrowLeft, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { googleSignIn } from '../lib/googleAuth';
import { User } from 'firebase/auth';

interface CRMLoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onBackToLanding: () => void;
}

export const CRMLoginView: React.FC<CRMLoginViewProps> = ({
  onLoginSuccess,
  onBackToLanding
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await googleSignIn();
      if (result) {
        onLoginSuccess(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#EAE5EC] shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#BF0B57] via-[#E0407D] to-[#69377D]" />

        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#BF0B57] to-[#E0407D] text-white flex items-center justify-center mx-auto shadow-md font-extrabold text-2xl">
          Y
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Panel de Administración CRM
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Acceso seguro para Yoly. Inicia sesión con tu cuenta de Gmail para gestionar tus contactos, editar leads y enviar mensajes con plantillas.
          </p>
        </div>

        {/* Benefits list */}
        <div className="bg-[#FAF8FB] p-4 rounded-2xl border border-[#EAE5EC] text-left text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#BF0B57] shrink-0" />
            <span>Gestión completa de leads recibidos en la feria</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#BF0B57] shrink-0" />
            <span>Envío de plantillas directas a WhatsApp y Gmail</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#BF0B57] shrink-0" />
            <span>Etiquetas, notas de seguimiento y exportación Excel</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
            {errorMessage}
          </div>
        )}

        {/* Official Google Sign In Button */}
        <div>
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 shadow-sm transition-all font-semibold text-xs sm:text-sm text-slate-700 cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {/* Google SVG Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar sesión con Google (Gmail)'}</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la landing pública</span>
          </button>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>Conexión segura</span>
          </div>
        </div>
      </div>
    </div>
  );
};
