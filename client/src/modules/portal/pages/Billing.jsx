import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../lib/firebase";
import { getCurrentUser } from "../lib/auth";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const PLANS = [
  {
    id: "basic",
    name: "Optical Order Tracker Basic",
    subtitle: "Single location, essential tracking",
    priceId: "price_1SY7yZLaOkTKZ383jFurcrbQ",
    priceDisplay: "$59",
    priceNote: "/mo per location",
    features: [
      "Core order + status tracking",
      "Customer status portal",
      "Dashboard overview widgets",
    ],
    badge: "Most popular",
  },
  {
    id: "plus",
    name: "Optical Order Tracker Plus",
    subtitle: "Multi-location and advanced stats",
    priceId: "price_1SY7yZLaOkTKZ383493Vc57H",
    priceDisplay: "$129",
    priceNote: "/mo up to 3 locations",
    features: [
      "Everything in Basic",
      "Advanced lab time + remakes analytics",
      "Daily lab prompts & overdue alerts",
    ],
    badge: "For growing teams",
  },
  {
    id: "pro",
    name: "Optical Order Tracker Max",
    subtitle: "High-volume opticals and labs",
    priceId: "price_1SY7yZLaOkTKZ383v8jmn7Tf",
    priceDisplay: "$220",
    priceNote: "/mo multi-location",
    features: [
      "Everything in Plus",
      "Priority support",
      "Early access to new features",
    ],
    badge: null,
  },
];

export default function Billing() {
  const user = getCurrentUser();
  const nav = useNavigate();
  const betaActive = !!user?.betaActive;
  const betaCode = (user?.betaCode || "").toUpperCase();

  const [error, setError] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);
  const [currentPriceId, setCurrentPriceId] = useState(null);

  // Watch Stripe subscriptions written by the Firestore–Stripe extension
  // and derive the current active plan's price ID (if any).
  useEffect(() => {
    if (!user) {
      setCurrentPriceId(null);
      return;
    }

    const subRef = collection(db, "customers", user.uid, "subscriptions");

    const unsub = onSnapshot(
      subRef,
      (snapshot) => {
        let activePriceId = null;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Treat trialing/active/past_due as "has a plan"
          if (
            data &&
            ["trialing", "active", "past_due"].includes(data.status) &&
            Array.isArray(data.items) &&
            data.items.length > 0 &&
            data.items[0].price &&
            data.items[0].price.id
          ) {
            activePriceId = data.items[0].price.id;
          }
        });

        setCurrentPriceId(activePriceId);
      },
      (err) => {
        console.error("Error loading subscription info:", err);
        // If there's an error (e.g. no permissions), just treat as no plan
        setCurrentPriceId(null);
      }
    );

    return () => unsub();
  }, [user]);

  async function handleStartSubscription(priceId) {
    if (!user) {
      setError("You need to be signed in to manage billing.");
      return;
    }
    setActivePlanId(priceId);

    setError("");
    setLoadingCheckout(true);

    try {
      // 1) Create a checkout session doc that the Firebase extension watches
      const checkoutRef = await addDoc(
        collection(db, "customers", user.uid, "checkout_sessions"),
        {
          price: priceId,
          mode: "subscription",
          success_url: window.location.origin + "/billing?session=success",
          cancel_url: window.location.origin + "/billing?session=cancel",
          // let Stripe Checkout accept promo codes (configured in your Stripe dashboard)
          allow_promotion_codes: true,
          // carry beta / promo code into Stripe metadata so you can see it on the session
          ...(betaActive && betaCode
            ? {
                metadata: {
                  betaCode,
                },
              }
            : {}),
        }
      );

      // 2) Listen for the extension to attach a Checkout URL or an error
      const unsub = onSnapshot(checkoutRef, (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.error) {
          console.error("Stripe checkout error:", data.error);
          setError(
            data.error.message || "There was a problem starting checkout."
          );
          setLoadingCheckout(false);
          setActivePlanId(null);
          unsub();
          return;
        }

        if (data.url) {
          // New extension behavior: we get a full Checkout URL
          unsub();
          setLoadingCheckout(false);
          setActivePlanId(null);
          window.location.assign(data.url);
        }
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to start checkout.");
      setLoadingCheckout(false);
      setActivePlanId(null);
    }
  }

  async function handleManageBilling() {
    if (!user) {
      setError("You need to be signed in to manage billing.");
      return;
    }

    setError("");
    setLoadingPortal(true);

    try {
      const functions = getFunctions();
      const createPortalLink = httpsCallable(
        functions,
        "ext-firestore-stripe-payments-createPortalLink"
      );

      const { data } = await createPortalLink({
        // where to send them after managing billing
        returnUrl: window.location.origin + "/billing",
      });

      if (!data || !data.url) {
        throw new Error("No billing portal URL returned from Stripe.");
      }

      window.location.assign(data.url);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to open billing portal.");
      setLoadingPortal(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-semibold">
            Billing &amp; Subscription
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl">
            Manage your subscription, update your card on file, and view invoices.
            Billing is handled securely by Stripe.
          </p>
        </div>
        <button
          type="button"
          onClick={() => nav("/settings")}
          className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1.5 text-[11px] md:text-xs text-slate-200 hover:bg-slate-900"
        >
          ← Back to settings
        </button>
      </div>

      {betaActive && (
        <div className="text-[11px] md:text-xs text-amber-100 bg-amber-900/40 border border-amber-500/60 rounded-xl px-3 py-2 flex items-start gap-2">
          <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/80 text-[10px] font-semibold text-black">
            %
          </span>
          <div>
            <div className="font-medium">Beta promo active</div>
            <div className="text-amber-100/90">
              At checkout, enter your promo code
              {betaCode ? (
                <span className="font-mono font-semibold mx-1">{betaCode}</span>
              ) : (
                <span className="font-mono font-semibold mx-1">(your code)</span>
              )}
              in the Stripe promo box to apply your beta discount.
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="text-xs md:text-sm text-red-300 bg-red-950/40 border border-red-700/70 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {/* Plan selector grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPriceId === plan.priceId;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-950/90 to-slate-900 px-4 py-4 md:px-5 md:py-5 shadow-lg shadow-black/40 flex flex-col justify-between ${
                isCurrent
                  ? "border-emerald-500/70 ring-1 ring-emerald-500/40"
                  : "border-slate-800/80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  {plan.badge && !isCurrent && (
                    <div className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-400/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-200">
                      {plan.badge}
                    </div>
                  )}
                  {isCurrent && (
                    <div className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-400/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
                      Current plan
                    </div>
                  )}
                </div>
                <h2 className="text-base md:text-lg font-semibold text-white">
                  {plan.name}
                </h2>
                <p className="text-[11px] md:text-xs text-slate-300">
                  {plan.subtitle}
                </p>
                <div className="mt-2">
                  <div className="text-xl md:text-2xl font-semibold text-white">
                    {plan.priceDisplay}
                    <span className="text-xs text-slate-400 font-normal">
                      {plan.priceNote}
                    </span>
                  </div>
                </div>
                <ul className="mt-3 text-[11px] md:text-xs text-slate-400 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => !isCurrent && handleStartSubscription(plan.priceId)}
                disabled={isCurrent || (loadingCheckout && activePlanId === plan.priceId)}
                className={`mt-4 w-full text-xs md:text-sm px-4 py-2 rounded-full transition-colors ${
                  isCurrent
                    ? "bg-slate-800 text-slate-200 border border-slate-600 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                }`}
              >
                {isCurrent
                  ? "You're on this plan"
                  : loadingCheckout && activePlanId === plan.priceId
                  ? "Starting checkout…"
                  : "Choose this plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Explanation / reassurance */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 px-4 py-3 text-[11px] md:text-xs text-slate-400 leading-relaxed">
        <p>
          Payments are processed by Stripe. Your card details never touch our
          servers—everything is handled through Stripe&apos;s secure Checkout
          and Billing Portal. You can cancel or change your plan at any time.
        </p>
      </div>
    </div>
  );
}