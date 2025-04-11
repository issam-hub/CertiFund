export const apiUrl = process.env.API_URL;
export const apiKey = process.env.NEXT_PUBLIC_API_KEY;
export const TOKEN_COOKIE_NAME = 'auth_token';
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/'
};

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;
