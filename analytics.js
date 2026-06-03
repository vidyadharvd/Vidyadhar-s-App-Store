/*
 * Shared analytics wrapper for Vidyadhar's App Store.
 *
 * Configure PostHog by filling the <meta name="posthog-project-token"> tag in
 * each HTML page, or by setting window.APP_ANALYTICS_CONFIG before this file.
 * Custom events are namespaced before capture so this app can safely share a
 * PostHog project with other personal sites.
 */
(function () {
  const DEFAULT_API_HOST = "https://us.i.posthog.com";
  const DEFAULTS_DATE = "2026-01-30";
  const DEFAULT_EVENT_PREFIX = "vappstore_";

  function readMeta(name) {
    const tag = document.querySelector(`meta[name="${name}"]`);
    return tag ? tag.getAttribute("content")?.trim() || "" : "";
  }

  const runtimeConfig = window.APP_ANALYTICS_CONFIG || {};
  const projectToken =
    runtimeConfig.posthogProjectToken ||
    readMeta("posthog-project-token");
  const apiHost =
    runtimeConfig.posthogApiHost ||
    readMeta("posthog-api-host") ||
    DEFAULT_API_HOST;
  const appNamespace =
    runtimeConfig.appNamespace ||
    readMeta("analytics-app-namespace") ||
    "vidyadhar_app_store";
  const eventPrefix =
    runtimeConfig.eventPrefix ||
    readMeta("analytics-event-prefix") ||
    DEFAULT_EVENT_PREFIX;
  const captureLocalhost = Boolean(runtimeConfig.captureLocalhost);
  const debug =
    Boolean(runtimeConfig.debug) ||
    localStorage.getItem("analytics-debug") === "true";
  const isLocalhost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?$/.test(
    window.location.host,
  );
  const enabled = Boolean(projectToken) && (captureLocalhost || !isLocalhost);

  function installPostHog(token, host) {
    if (!token || window.posthog?.__loaded) return;

    /* PostHog's browser snippet, kept here so this static app has no build step. */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    window.posthog.init(token, {
      api_host: host,
      defaults: DEFAULTS_DATE,
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
    });
    window.posthog.__loaded = true;
  }

  function baseProperties() {
    return {
      app_namespace: appNamespace,
      app_surface: document.body.dataset.analyticsSurface || "app_store",
      page_path: window.location.pathname,
      page_title: document.title,
    };
  }

  function eventNameWithNamespace(eventName) {
    if (!eventName || eventName.startsWith("$")) return eventName;
    if (!eventPrefix || eventName.startsWith(eventPrefix)) return eventName;
    return eventPrefix + eventName;
  }

  function capture(eventName, properties = {}) {
    const namespacedEventName = eventNameWithNamespace(eventName);
    const payload = { ...baseProperties(), ...properties };

    if (debug) {
      console.info("[analytics]", namespacedEventName, payload);
    }

    if (!enabled || !window.posthog?.capture) return;
    window.posthog.capture(namespacedEventName, payload);
  }

  function page(properties = {}) {
    capture("$pageview", {
      $current_url: window.location.href,
      ...properties,
    });
  }

  if (enabled) {
    installPostHog(projectToken, apiHost);
  } else if (debug) {
    console.info("[analytics] PostHog disabled", {
      hasProjectToken: Boolean(projectToken),
      isLocalhost,
      captureLocalhost,
    });
  }

  window.AppAnalytics = {
    capture,
    page,
    enabled,
    debug,
    appNamespace,
    eventPrefix,
  };
})();
