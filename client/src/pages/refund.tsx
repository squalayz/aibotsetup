import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function RefundPage() {
  const [, navigate] = useLocation();

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-8 text-muted-foreground"
          data-testid="button-back-refund"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="heading-refund">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 12, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Overview</h2>
            <p>
              At CLAWD, we want you to be fully satisfied with your purchase. This refund policy outlines
              the conditions under which refunds may be issued for our AI bot setup services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Self-Setup Guide ($199)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Refund requests must be made within 7 days of purchase</li>
              <li>If you have not accessed the guide, a full refund will be issued</li>
              <li>If you have accessed the guide but are unsatisfied, we will work with you to resolve any issues before considering a refund</li>
              <li>Refunds are not available after 7 days from the date of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. VIP 1-on-1 Session ($799)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full refund available if you cancel at least 24 hours before your scheduled session</li>
              <li>Cancellations made less than 24 hours before the session are eligible for rescheduling but not a refund</li>
              <li>If we cancel or are unable to conduct the session, you will receive a full refund or the option to reschedule</li>
              <li>If you are unsatisfied with the session, contact us within 48 hours and we will offer a follow-up session or partial refund at our discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. How to Request a Refund</h2>
            <p>
              To request a refund, please contact us through our website at aibotsetup.com with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your name and email used at purchase</li>
              <li>Transaction reference or payment confirmation</li>
              <li>Reason for the refund request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Refund Processing</h2>
            <p>
              Approved refunds will be processed within 5-10 business days. Refunds will be issued
              to the original payment method used for the purchase. For cryptocurrency payments,
              refunds will be sent to the wallet address provided by the customer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Non-Refundable Items</h2>
            <p>The following are not eligible for refunds:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Services fully delivered and completed</li>
              <li>VIP sessions that were attended in full</li>
              <li>Requests made outside the eligible refund window</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Exceptions</h2>
            <p>
              We understand that special circumstances may arise. If your situation doesn't fall within
              the standard refund policy, please reach out to us and we will do our best to find a
              fair resolution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact</h2>
            <p>
              For refund requests or questions about this policy, please reach out through our website at aibotsetup.com.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
