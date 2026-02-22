export async function onRequestGet(context) {
  const client_id = context.env.MICROSOFT_CLIENT_ID;
  const redirect_uri = `${new URL(context.request.url).origin}/api/auth/microsoft_callback`;
  
  const params = new URLSearchParams({
    client_id: client_id,
    response_type: 'code',
    redirect_uri: redirect_uri,
    response_mode: 'query',
    scope: 'openid email profile User.Read',
    prompt: 'select_account'
  });

  return Response.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`, 302);
}