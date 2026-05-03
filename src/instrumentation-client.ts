type RouterTransitionFn = (url: string, navigationType: 'push' | 'replace' | 'traverse') => void

let captureRouterTransitionStart: RouterTransitionFn | undefined

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import('@sentry/nextjs').then(Sentry => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      enabled: process.env.NODE_ENV === 'production',
    })
    captureRouterTransitionStart = Sentry.captureRouterTransitionStart
  })
}

if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      person_profiles: 'identified_only',
      loaded: ph => {
        if (process.env.NODE_ENV !== 'production') ph.opt_out_capturing()
      },
    })
  })
}

export const onRouterTransitionStart: RouterTransitionFn = (url, type) => {
  captureRouterTransitionStart?.(url, type)
}
