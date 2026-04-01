export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUser(): { id: string; email: string; name: string } | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = parseJwt(token);
    return {
      id: payload.sub ?? '',
      email: payload.email ?? '',
      name: payload.name ?? '',
    };
  } catch {
    return null;
  }
}

export function parseJwt(token: string): any {
  const base64Url = token.split('.')[1];
  if (!base64Url) throw new Error('Invalid token');
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}