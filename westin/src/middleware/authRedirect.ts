import { NextRequest, NextResponse } from 'next/server';

// Middleware pentru a proteja rutele și a gestiona redirecționarea utilizatorilor
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAdmin = request.cookies.get('isAdmin')?.value === 'true';
  const path = request.nextUrl.pathname;
  
  // Rute care necesită autentificare
  const protectedRoutes = ['/game', '/first-login', '/admin'];
  
  // Redirecționarea pentru rute protejate când utilizatorul nu este autentificat
  if (protectedRoutes.some(route => path.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirecționarea pentru admin - doar administratorii pot accesa routele /admin
  if (path.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/game', request.url));
  }
  
  // Dacă utilizatorul este autentificat și încearcă să acceseze pagina principală, redirecționează-l către joc
  if (path === '/' && token) {
    return NextResponse.redirect(new URL('/game', request.url));
  }
  
  return NextResponse.next();
}

// Configurăm middleware-ul să ruleze pentru rutele specificate
export const config = {
  matcher: ['/', '/game', '/first-login', '/admin/:path*'],
}; 