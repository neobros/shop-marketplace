import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/api';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client?hl=en';

let scriptPromise;
/** Load Google Identity Services once. */
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load Google sign-in'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export const googleEnabled = !!CLIENT_ID;

/**
 * VITE_GOOGLE_ONLY=true -> customers and artisans can only sign up / sign in with Google.
 * The email form stays reachable on the login page behind "Staff / admin? Sign in with email"
 * so password accounts (like the admin) are never locked out.
 * Ignored when no Google Client ID is set, so the site can't end up with no way to sign in.
 */
export const googleOnly = googleEnabled && String(import.meta.env.VITE_GOOGLE_ONLY).toLowerCase() === 'true';

/**
 * Google's official "Continue with Google" button. Signs the user in (or creates their account)
 * and calls onSuccess(user, created). Renders nothing when VITE_GOOGLE_CLIENT_ID is not set.
 */
export default function GoogleButton({ text = 'continue_with', onSuccess }) {
  const { loginWithGoogle } = useAuth();
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  const callbackRef = useRef();

  callbackRef.current = async ({ credential }) => {
    try {
      const { user, created } = await loginWithGoogle(credential);
      onSuccess?.(user, created);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => callbackRef.current(res),
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
        });
        const width = Math.min(400, Math.max(200, Math.round(ref.current.offsetWidth || 320)));
        window.google.accounts.id.renderButton(ref.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text, // continue_with | signup_with | signin_with
          logo_alignment: 'center',
          locale: 'en', // match the site's language (Google otherwise follows the browser's language)
          width,
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!CLIENT_ID) return null;
  if (failed) return <p className="text-center text-xs text-slate-400">Google sign-in is unavailable right now.</p>;
  return <div ref={ref} className="flex min-h-[44px] w-full justify-center" />;
}

/** "or" divider shown between the Google button and the email form. */
export function OrDivider({ label = 'or use your email' }) {
  if (!CLIENT_ID) return null;
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
      <span className="h-px flex-1 bg-slate-200" /> {label} <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
