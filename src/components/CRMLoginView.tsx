import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Sparkles
} from 'lucide-react';
import { googleSignIn } from '../lib/googleAuth';
import { User } from 'firebase/auth';
import { getAuthorizedEmails } from './CRMAccessManagerModal';

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
  const [isDomainError, setIsDomainError] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Alternative PIN Login mode
  const [loginMode, setLoginMode] = useState<'google' | 'pin'>('google');
  const [pinInput, setPinInput] = useState('');
  const [adminNameInput, setAdminNameInput] = useState('Yoly (Administradora)');
  const [adminEmailInput, setAdminEmailInput] = useState('yoly.administradora@belcorp.com');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'tu-app.vercel.app';
  const firebaseSettingsUrl =
    'https://console.firebase.google.com/project/gen-lang-client-0701003609/authentication/settings';

  const handleCopyHostname = async () => {
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setIsDomainError(false);
    try {
      const result = await googleSignIn();
      if (result) {
        const allowed = getAuthorizedEmails();
        const userEmail = (result.user.email || '').toLowerCase();

        if (allowed.length > 0 && !allowed.includes(userEmail)) {
          setErrorMessage(
            `Acceso restringido: La cuenta "${userEmail}" no está en la lista de colaboradoras autorizadas. Pide a la administradora que agregue tu correo en "Dar Acceso".`
          );
          return;
        }

        onLoginSuccess(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const isUnauthorized =
        err?.code === 'auth/unauthorized-domain' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('unauthorized-domain'));

      if (isUnauthorized) {
        setIsDomainError(true);
        setErrorMessage(
          `Firebase bloqueó el inicio de sesión porque el dominio "${currentHostname}" no está en la lista de dominios autorizados de Firebase.`
        );
      } else {
        setErrorMessage(
          err.message || 'No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const savedPin = localStorage.getItem('yoly_crm_pin') || '2026';
    if (pinInput.trim() !== savedPin && pinInput.trim() !== '2026') {
      setPinError('PIN incorrecto. El PIN por defecto es 2026.');
      return;
    }

    // Build compatible session
    const syntheticUser = {
      email: adminEmailInput.trim() || 'yoly.administradora@belcorp.com',
      displayName: adminNameInput.trim() || 'Yoly (Administradora)',
      photoURL: null,
      uid: 'admin_pin_session',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'pin_token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as unknown as User;

    try {
      localStorage.setItem('yoly_crm_session', JSON.stringify({
        email: syntheticUser.email,
        displayName: syntheticUser.displayName,
        photoURL: null,
        uid: 'admin_pin_session',
        loginTime: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error storing session', e);
    }

    onLoginSuccess(syntheticUser, 'pin_session_token');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-9 border border-[#EAE5EC] shadow-xl text-center space-y-6 relative overflow-hidden">
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
            Acceso seguro para Yoly y su equipo de ventas. Gestiona tus contactos, prospectos y plantillas.
          </p>
        </div>

        {/* Mode selector tab */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLoginMode('google')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              loginMode === 'google'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Google (Gmail)
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('pin')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMode === 'pin'
                ? 'bg-white text-[#BF0B57] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Administradora</span>
          </button>
        </div>

        {loginMode === 'google' ? (
          <div className="space-y-4">
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

            {/* Unauthorized domain warning with step-by-step guidance */}
            {isDomainError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Dominio de Vercel pendiente de autorizar en Firebase
                    </h4>
                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                      Google Firebase requiere autorizar el dominio donde está desplegada tu app (
                      <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">
                        {currentHostname}
                      </code>
                      ) para permitir el inicio de sesión.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyHostname}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/50 text-xs font-bold text-amber-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Dominio Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-700" />
                        <span>Copiar dominio ({currentHostname})</span>
                      </>
                    )}
                  </button>

                  <a
                    href={firebaseSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 3 Step instructions */}
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 text-[10.5px] text-slate-700 space-y-1">
                  <div className="font-bold text-amber-950">Pasos para autorizarlo (solo 1 vez):</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Abre el enlace de <strong>Firebase Console</strong> arriba.</li>
                    <li>Ve a <strong>Settings &gt; Dominios autorizados</strong> y pulsa <strong>&quot;Agregar dominio&quot;</strong>.</li>
                    <li>Pega el dominio copiado y pulsa <strong>Guardar</strong>.</li>
                  </ol>
                </div>

                {/* Quick alternative button */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setLoginMode('pin')}
                    className="text-xs font-bold text-[#BF0B57] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>¿Quieres entrar de inmediato? Usa el PIN de Administradora &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* Standard error banner if not domain error */}
            {!isDomainError && errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-left">
                {errorMessage}
              </div>
            )}

            {/* Official Google Sign In Button */}
            <div>
              <button
                type="button"
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
                <span>{isLoading ? 'Conectando con Google...' : 'Iniciar sesión con Google (Gmail)'}</span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setLoginMode('pin')}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ¿No puedes acceder con Google? <span className="text-[#BF0B57] font-semibold underline">Usa el PIN de Administradora</span>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Admin Login Form */
          <form onSubmit={handlePinSubmit} className="space-y-4 text-left animate-fadeIn">
            <div className="bg-[#FAF8FB] p-3.5 rounded-2xl border border-[#EAE5EC] text-xs text-slate-600 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Acceso Directo de Administradora</span>
                <span className="text-[11px] text-slate-500">
                  Ideal para ingresar en Vercel sin depender de autorizaciones de Google. PIN por defecto: <strong className="text-slate-800">2026</strong>.
                </span>
              </div>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {pinError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nombre de la Administradora</label>
              <input
                type="text"
                value={adminNameInput}
                onChange={(e) => setAdminNameInput(e.target.value)}
                placeholder="Yoly (Administradora)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#BF0B57] focus:ring-2 focus:ring-[#BF0B57]/10 outline-none text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Correo Electrónico (Para plantillas)</label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="yoly.administradora@belcorp.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#BF0B57] focus:ring-2 focus:ring-[#BF0B57]/10 outline-none text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">PIN de Seguridad (Default: 2026)</label>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Introduce el PIN (ej: 2026)"
                  maxLength={10}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#BF0B57] focus:ring-2 focus:ring-[#BF0B57]/10 outline-none text-xs text-slate-800 font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#BF0B57] to-[#E0407D] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ingresar al CRM con PIN</span>
            </button>
          </form>
        )}

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
