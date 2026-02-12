import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const [, navigate] = useLocation();

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-8 text-muted-foreground"
          data-testid="button-back-privacy"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="heading-privacy">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 12, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>When you use CLAWD at aibotsetup.com, we may collect the following information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Contact Information:</strong> Name, email address, and phone number provided during booking</li>
              <li><strong className="text-foreground">Payment Information:</strong> Transaction hashes and wallet addresses for cryptocurrency payments</li>
              <li><strong className="text-foreground">Booking Data:</strong> Session dates, times, and service tier selected</li>
              <li><strong className="text-foreground">Usage Data:</strong> Pages visited and interactions with our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process payments and verify transactions</li>
              <li>Schedule and conduct VIP setup sessions</li>
              <li>Provide access to self-setup guides</li>
              <li>Communicate about your bookings and services</li>
              <li>Improve our platform and service offerings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
            <p>
              Your data is stored securely in our database systems. We implement appropriate technical
              and organizational measures to protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. Payment transaction data is stored as blockchain
              transaction references only — we do not store private keys or wallet credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share
              data only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>With payment processors to complete transactions</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights, property, or safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Cookies and Tracking</h2>
            <p>
              Our platform may use essential cookies for session management and functionality. We do not
              use third-party tracking cookies or advertising trackers. No data is shared with advertising
              networks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us through our website.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to provide our services and fulfill
              the purposes outlined in this policy. Payment records are retained for accounting and legal
              compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated effective date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Contact</h2>
            <p>
              For privacy-related questions or requests, please reach out through our website at aibotsetup.com.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
