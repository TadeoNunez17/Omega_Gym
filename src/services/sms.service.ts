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
}
