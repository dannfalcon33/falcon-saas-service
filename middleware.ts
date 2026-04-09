import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes check
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  if (isDashboard || isAdmin) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role check and status check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (isAdmin) {
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    if (isDashboard && profile?.role === 'client') {
      // Avoid infinite loop if already on pending
      const isPendingPage = request.nextUrl.pathname === '/dashboard/pending';
      
      // Check commercial status using the view mentioned in requirements
      const { data: status } = await supabase
        .from('v_client_access_status')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      const isActive = status?.subscription_status === 'active' && status?.client_status === 'active';

      if (!isActive && !isPendingPage) {
        return NextResponse.redirect(new URL('/dashboard/pending', request.url));
      }

      if (isActive && isPendingPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // Redirect authenticated users away from login
  if (user && request.nextUrl.pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};
