'use client'

import * as React from 'react'
import { Cookie, X, Shield, BarChart2, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ConsentState = {
    necessary: boolean
    analytics: boolean
    preferences: boolean
}

const CONSENT_KEY = 'resumepilot_cookie_consent'
const CONSENT_VERSION = '1'

function loadConsent(): ConsentState | null {
    try {
        const raw = localStorage.getItem(CONSENT_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (parsed.version !== CONSENT_VERSION) return null
        return parsed.consent as ConsentState
    } catch {
        return null
    }
}

function saveConsent(consent: ConsentState) {
    try {
        localStorage.setItem(
            CONSENT_KEY,
            JSON.stringify({ version: CONSENT_VERSION, consent, savedAt: new Date().toISOString() })
        )
    } catch { }
}

export function CookieConsent() {
    const [visible, setVisible] = React.useState(false)
    const [showDetails, setShowDetails] = React.useState(false)
    const [consent, setConsent] = React.useState<ConsentState>({
        necessary: true,   // always on
        analytics: false,
        preferences: false,
    })

    React.useEffect(() => {
        let cancelled = false
        const existing = loadConsent()
        if (!existing) {
            const t = setTimeout(() => {
                if (!cancelled) setVisible(true)
            }, 600)
            return () => {
                cancelled = true
                clearTimeout(t)
            }
        }
    }, [])

    function acceptAll() {
        const full: ConsentState = { necessary: true, analytics: true, preferences: true }
        saveConsent(full)
        setVisible(false)
    }

    function rejectAll() {
        const minimal: ConsentState = { necessary: true, analytics: false, preferences: false }
        saveConsent(minimal)
        setVisible(false)
    }

    function saveCustom() {
        saveConsent(consent)
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Cookie consent"
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 flex justify-center pointer-events-none"
        >
            <style>{`
        @keyframes cookieBannerSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
            <div
                className="
          pointer-events-auto w-full max-w-2xl
          bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-700
          rounded-2xl shadow-2xl
          overflow-hidden
        "
                style={{ animation: 'cookieBannerSlideUp 0.4s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-start gap-3 px-5 pt-5 pb-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Cookie className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                            We value your privacy
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic.
                            By clicking <strong>"Accept All"</strong> you consent to our use of cookies.{' '}
                            <button
                                onClick={() => setShowDetails(v => !v)}
                                className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                {showDetails ? 'Hide details' : 'Manage preferences'}
                            </button>
                        </p>
                    </div>
                    <button
                        onClick={rejectAll}
                        aria-label="Dismiss and reject optional cookies"
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0 mt-0.5"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Expandable details */}
                {showDetails && (
                    <div className="mt-4 mx-5 space-y-3">
                        {/* Necessary */}
                        <div className="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3">
                            <Shield className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Strictly Necessary</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Required for authentication, security and core functionality. Cannot be disabled.
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                    Always on
                                </span>
                            </div>
                        </div>

                        {/* Analytics */}
                        <label className="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3 cursor-pointer group">
                            <BarChart2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Analytics</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Help us understand how visitors interact with our site so we can improve it.
                                </p>
                            </div>
                            <div className="flex-shrink-0 mt-0.5">
                                <input
                                    id="consent-analytics"
                                    type="checkbox"
                                    checked={consent.analytics}
                                    onChange={e => setConsent(c => ({ ...c, analytics: e.target.checked }))}
                                    className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                                />
                            </div>
                        </label>

                        {/* Preferences */}
                        <label className="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3 cursor-pointer group">
                            <Settings2 className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Preferences</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Remember your settings such as theme, language and layout preferences across sessions.
                                </p>
                            </div>
                            <div className="flex-shrink-0 mt-0.5">
                                <input
                                    id="consent-preferences"
                                    type="checkbox"
                                    checked={consent.preferences}
                                    onChange={e => setConsent(c => ({ ...c, preferences: e.target.checked }))}
                                    className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                                />
                            </div>
                        </label>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-5 py-4 mt-2">
                    <Button
                        id="cookie-reject-btn"
                        variant="outline"
                        size="sm"
                        onClick={rejectAll}
                        className="flex-1 sm:flex-none border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Reject All
                    </Button>

                    {showDetails && (
                        <Button
                            id="cookie-save-btn"
                            variant="outline"
                            size="sm"
                            onClick={saveCustom}
                            className="flex-1 sm:flex-none border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                            Save preferences
                        </Button>
                    )}

                    <Button
                        id="cookie-accept-btn"
                        size="sm"
                        onClick={acceptAll}
                        className="
              flex-1 sm:flex-none
              bg-gradient-to-r from-purple-600 to-blue-600
              hover:from-purple-700 hover:to-blue-700
              text-white border-0
            "
                    >
                        Accept All
                    </Button>
                </div>

                {/* Footer links */}
                <div className="px-5 pb-4 flex gap-4">
                    <a
                        href="/privacy"
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors"
                    >
                        Privacy Policy
                    </a>
                    <a
                        href="/terms"
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors"
                    >
                        Terms of Service
                    </a>
                    <a
                        href="/cookies"
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors"
                    >
                        Cookie Policy
                    </a>
                </div>
            </div>
        </div>
    )
}
