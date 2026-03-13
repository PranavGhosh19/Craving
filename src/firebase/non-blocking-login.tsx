'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  // We catch the error to prevent unhandled promise rejections.
  signInAnonymously(authInstance).catch((error) => {
    // This error is usually handled by the onAuthStateChanged listener in the provider
    // or surfaced through the UI if we were to emit it.
    console.error("Auth Error (initiateAnonymousSignIn):", error.code, error.message);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly.
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Auth Error (initiateEmailSignUp):", error.code, error.message);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly.
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Auth Error (initiateEmailSignIn):", error.code, error.message);
  });
}
