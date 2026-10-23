export const isStrongPassword = (password: string): boolean =>
  password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

export const passwordPolicyMessage =
  "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.";
