import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-8 text-muted-foreground"
          data-testid="button-back-terms"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="heading-terms">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 12, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using the CLAWD platform ("Service") operated by CLAWD ("we," "us," or "our"),
              available at aibotsetup.com, you agree to be bound by these Terms of Service. If you do not
              agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              CLAWD provides AI bot setup and configuration services for businesses. We offer two service tiers:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Self-Setup ($199):</strong> A step-by-step interactive guide for setting up your AI bot independently using OpenClaw, ClawHub, and Moltbook.</li>
              <li><strong className="text-foreground">VIP 1-on-1 ($799):</strong> A live screen-share session with personalized setup, custom bot personality configuration, and priority support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Payment Terms</h2>
            <p>
              All payments are processed through our supported payment methods. Prices are listed in USD.
              Payment must be completed before access to services is granted. By making a payment, you
              confirm that you are authorized to use the selected payment method.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Service Delivery</h2>
            <p>
              For Self-Setup purchases, access to the guide is granted immediately upon confirmed payment.
              For VIP sessions, booking is available after payment confirmation. Sessions are scheduled
              during available time slots on weekdays.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide accurate information when booking sessions or making payments</li>
              <li>Use the AI bots and services in compliance with all applicable laws</li>
              <li>Not resell, redistribute, or share access to guides or session content without permission</li>
              <li>Maintain the security of any API keys or credentials provided during setup</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>
              All content, guides, branding, and materials on this platform are the property of CLAWD.
              You may not copy, reproduce, or distribute any materials without written consent. The AI bots
              configured during your session are yours to use, but the setup methodology and guide content
              remain our intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Third-Party Services</h2>
            <p>
              Our service integrates with third-party platforms including OpenClaw, ClawHub, and Moltbook.
              We are not responsible for the availability, terms, or policies of these third-party services.
              Your use of those platforms is subject to their respective terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              CLAWD is provided "as is" without warranties of any kind. We are not liable for any indirect,
              incidental, or consequential damages arising from your use of the Service. Our total liability
              is limited to the amount you paid for the specific service in question.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on this page
              with an updated date. Continued use of the Service after changes constitutes acceptance of
              the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact</h2>
            <p>
              If you have questions about these Terms, please reach out through our website at aibotsetup.com.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
