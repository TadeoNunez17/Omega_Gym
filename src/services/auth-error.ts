export function translateAuthError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()

    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials'))
      return 'Correo o contraseña incorrectos'
    if (msg.includes('email not confirmed'))
      return 'Debes confirmar tu correo electrónico antes de iniciar sesión'
    if (msg.includes('user already registered') || msg.includes('already registered'))
      return 'Ya existe una cuenta con este correo'
    if (msg.includes('invalid email'))
      return 'Ingresa un correo electrónico válido'
    if (msg.includes('at least 6 characters') || msg.includes('password should be'))
      return 'La contraseña debe tener al menos 6 caracteres'
    if (msg.includes('rate limit') || msg.includes('only request this after'))
      return 'Demasiados intentos. Espera unos segundos e inténtalo de nuevo'
    if (msg.includes('token has expired') || msg.includes('token is invalid'))
      return 'El enlace ha expirado o no es válido. Solicita uno nuevo'
    if (msg.includes('user not found'))
      return 'No encontramos una cuenta con ese correo'
    if (msg.includes('email rate limit exceeded'))
      return 'Hemos enviado muchos correos. Espera un momento e inténtalo de nuevo'
    if (msg.includes('invalid refresh token'))
      return 'Tu sesión expiró. Inicia sesión nuevamente'
  }
  return 'Ha ocurrido un error. Inténtalo de nuevo'
}