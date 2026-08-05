(async () => {
  const statusNode = document.querySelector("[data-oauth-status]");
  const diagnosticNode = document.querySelector("[data-oauth-diagnostic]");
  const fail = (error) => {
    const detail = [error?.name, error?.message, error?.stack].filter(Boolean).join("\n");
    statusNode.textContent = "No pudimos completar el acceso con Google.";
    diagnosticNode.hidden = false;
    diagnosticNode.textContent = detail || String(error || "OAUTH_CALLBACK_UNKNOWN");
  };

  try {
    const env = window.__ENV__ || {};
    if (!env.SUPABASE_URL || !(env.SUPABASE_KEY || env.SUPABASE_ANON_KEY)) {
      throw new Error("OAUTH_CALLBACK_CONFIG_MISSING");
    }
    if (!window.supabase?.createClient) throw new Error("OAUTH_CALLBACK_SDK_MISSING");

    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const providerError = url.searchParams.get("error_description") || hash.get("error_description") || url.searchParams.get("error") || hash.get("error");
    if (providerError) throw new Error(providerError);

    const client = window.supabase.createClient(
      env.SUPABASE_URL,
      env.SUPABASE_KEY || env.SUPABASE_ANON_KEY,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: "implicit" } },
    );

    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) throw error;
    }

    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data?.session?.user?.id) {
      throw new Error(`OAUTH_CALLBACK_SESSION_MISSING hash_keys=${[...hash.keys()].join(",") || "none"} search_keys=${[...url.searchParams.keys()].join(",") || "none"}`);
    }

    statusNode.textContent = "Sesión confirmada. Abriendo Pipeline…";
    window.location.replace("./auth-v4.html?route=pipeline&auth=google");
  } catch (error) {
    fail(error);
  }
})();
