// import {
//   sendSignInLinkToEmail,
//   signInWithEmailLink,
//   isSignInWithEmailLink,
//   onAuthStateChanged,
//   signOut
// } from "firebase/auth"
// import { auth } from "./../../../lib/firebase"

// const actionCodeSettings = {
//   url: `${window.location.origin}/login`,
//   handleCodeInApp: true,
// }

// export async function sendLoginLink(email) {
//   await sendSignInLinkToEmail(auth, email, actionCodeSettings)
//   window.localStorage.setItem("emailForSignIn", email)
// }

// export async function completeEmailLogin() {
//   if (!isSignInWithEmailLink(auth, window.location.href)) return null

//   const email =
//     window.localStorage.getItem("emailForSignIn") ||
//     window.prompt("Confirm your email")

//   const result = await signInWithEmailLink(auth, email, window.location.href)
//   window.localStorage.removeItem("emailForSignIn")
//   return result.user
// }

// export function listenForAuth(callback) {
//   return onAuthStateChanged(auth, callback)
// }

// export function logout() {
//   return signOut(auth)
// }