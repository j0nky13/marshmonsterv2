// import { useEffect, useState } from "react";
// import {
//   auth,
//   isSignInWithEmailLink,
//   sendSignInLinkToEmail,
//   signInWithEmailLink
// } from "../firebase/firebase";

// export default function LoginScreen({ onLogin }) {
//   const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);
//   const [checkingLink, setCheckingLink] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function completeEmailLinkLogin() {
//       try {
//         if (!isSignInWithEmailLink(auth, window.location.href)) {
//           setCheckingLink(false);
//           return;
//         }

//         const savedEmail = window.localStorage.getItem("emailForSignIn");
//         const finalEmail = savedEmail || window.prompt("Confirm your email");

//         if (!finalEmail) {
//           throw new Error("Email is required to complete login.");
//         }

//         await signInWithEmailLink(auth, finalEmail, window.location.href);

//         window.localStorage.removeItem("emailForSignIn");

//         window.history.replaceState({}, document.title, window.location.pathname);

//         await onLogin();
//       } catch (err) {
//         setError(err.message || "Failed to complete login.");
//       } finally {
//         setCheckingLink(false);
//       }
//     }

//     completeEmailLinkLogin();
//   }, [onLogin]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");

//     try {
//       if (!email.trim()) {
//         throw new Error("Email is required.");
//       }

//       const actionCodeSettings = {
//         url: `${window.location.origin}/portal`,
//         handleCodeInApp: true
//       };

//       await sendSignInLinkToEmail(auth, email.trim().toLowerCase(), actionCodeSettings);

//       window.localStorage.setItem("emailForSignIn", email.trim().toLowerCase());

//       setSent(true);
//     } catch (err) {
//       setError(err.message || "Failed to send login link.");
//     }
//   }

//   if (checkingLink) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <div className="text-zinc-400">Checking secure login link...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
//       <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
//         <div className="mb-8 text-center">
//           <h1 className="text-4xl font-black">Marsh Monster</h1>
//           <p className="text-lime-400 mt-2">CRM 2.0 Secure Portal</p>
//         </div>

//         {sent ? (
//           <div className="rounded-2xl bg-lime-400/10 border border-lime-400/30 p-4 text-lime-300">
//             Login link sent. Check your email and click the link to continue. (also check your junk folder!)
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-5">
//             {error && (
//               <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
//                 {error}
//               </div>
//             )}

//             <div>
//               <label className="block text-sm text-zinc-400 mb-2">
//                 Email address
//               </label>

//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@marshmonster.com"
//                 className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-lime-400"
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-lime-400 text-black font-bold rounded-xl py-3 hover:bg-lime-300 transition"
//             >
//               Send Login Link
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  auth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "../firebase/firebase";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function completeEmailLinkLogin() {
      try {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setCheckingLink(false);
          return;
        }

        const savedEmail = window.localStorage.getItem("emailForSignIn");
        const finalEmail = savedEmail || window.prompt("Confirm your email");

        if (!finalEmail) {
          throw new Error("Email is required to complete login.");
        }

        await signInWithEmailLink(auth, finalEmail, window.location.href);

        window.localStorage.removeItem("emailForSignIn");
        window.history.replaceState({}, document.title, window.location.pathname);

        await onLogin();
      } catch (err) {
        setError(err.message || "Failed to complete login.");
      } finally {
        setCheckingLink(false);
      }
    }

    completeEmailLinkLogin();
  }, [onLogin]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (!email.trim()) {
        throw new Error("Email is required.");
      }

      await sendSignInLinkToEmail(auth, email.trim().toLowerCase(), {
        url: `${window.location.origin}/portal`,
        handleCodeInApp: true
      });

      window.localStorage.setItem("emailForSignIn", email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send login link.");
    }
  }

  if (checkingLink) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-lime-400/20 rounded-full" />
          <div className="relative text-zinc-300 font-semibold">
            Checking secure login link...
          </div>
        </div>
      </div>
    );
  }

  const floating = email.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.24),transparent_35%),linear-gradient(135deg,rgba(20,20,20,1),rgba(0,0,0,1)_60%)]" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-lime-400/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-zinc-800/80 bg-zinc-950/85 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <img
            src="/header-logo light2.svg"
            alt="Marsh Monster"
            className="mx-auto h-20 w-auto object-contain"
          />

          <p className="mt-5 text-lime-400 font-semibold tracking-wide">
            CRM 2.0 Secure Portal
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and we’ll send a secure login link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-lime-400/10 border border-lime-400/30 p-5 text-lime-300 leading-relaxed">
            Login link sent. Check your email and click the link to continue.
            Also check your junk folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
                {error}
              </div>
            )}

            <label className="relative block">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full bg-black/80 border border-zinc-700 rounded-2xl px-4 pt-6 pb-3 text-white outline-none focus:border-lime-400 transition"
              />

              <span
                className={`absolute left-4 transition-all pointer-events-none ${
                  floating
                    ? "top-2 text-xs text-lime-400"
                    : "top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-lime-400"
                }`}
              >
                Email address
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-lime-400 py-3.5 font-black text-black shadow-lg shadow-lime-400/20 transition hover:bg-lime-300 hover:scale-[1.01] active:scale-[0.99]"
            >
              Send Login Link
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-zinc-600">
          Protected by Firebase Auth + Marsh Monster role access.
        </p>
      </div>
    </div>
  );
}