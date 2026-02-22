export async function onRequestGet(context) {
  const client_id = context.env.GOOGLE_CLIENT_ID;
  const redirect_uri = `${new URL(context.request.url).origin}/api/auth/google_callback`;
  
  const params = new URLSearchParams({
    client_id: client_id,
    redirect_uri: redirect_uri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account'
  });

  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
}