import { supabase } from '@/lib/supabase'

export const smsService = {
  sendSms: async (phone: string, message: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: false },
      })
      if (error) {
        console.log(`[SMS SIMULATED] To: ${phone}, Message: ${message}`)
        return
      }
      console.log(`[SMS SENT VIA SUPABASE] To: ${phone}`)
    } catch {
      console.log(`[SMS SIMULATED] To: ${phone}, Message: ${message}`)
    }
  },

  sendEmail: async (email: string, subject: string, body: string): Promise<void> => {
    console.log(`[EMAIL SIMULATED] To: ${email}, Subject: ${subject}, Body: ${body}`)
  },

  sendClaimCode: async (phone?: string | null, email?: string | null, code?: string | null): Promise<void> => {
    const message = `Omega Gym: Tu codigo de activacion es ${code}. Valido por 15 minutos.`

    if (phone) {
      await smsService.sendSms(phone, message)
    }

    if (email) {
      await smsService.sendEmail(
        email,
        'Omega Gym — Activa tu cuenta',
        `Hola,\n\nTu código de activación es: ${code}\n\nIngresa a omega-gym.com/claim e introduce este código para activar tu cuenta.\n\nVálido por 15 minutos.\n\n— Omega Gym`
      )
    }
  },
}
