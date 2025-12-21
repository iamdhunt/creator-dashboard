import { supportEmail } from "~/constants/details";

export default function TermsOfService() {
  return (
    <div className="p-8 mx-auto">
      <h1>Terms of Service</h1>
      <p>Last updated: December 18, 2025</p>

      <h2>1. Service Description</h2>
      <p>
        Synqlo provides a read-only analytics dashboard that allows creators to
        view performance metrics from connected social and content platforms.
      </p>
      <p>
        Synqlo does not guarantee data accuracy, availability, or completeness,
        as data is supplied by third-party platforms.
      </p>

      <h2>2. Account Responsibilities</h2>
      <p>Users are responsible for:</p>
      <ul>
        <li>Maintaining the security of their login credentials</li>
        <li>Authorizing access only to accounts they own or manage</li>
        <li>Complying with the terms of connected third-party platforms</li>
      </ul>

      <h2>3. Acceptable Use</h2>
      <p>Users may not:</p>
      <ul>
        <li>Attempt to bypass platform API restrictions</li>
        <li>Use Synqlo to violate third-party terms</li>
        <li>Misuse or scrape data beyond authorized scopes</li>
      </ul>

      <h2>4. Third-Party Integrations</h2>
      <p>
        Synqlo relies on APIs provided by Meta, TikTok, Google/YouTube, and
        other platforms.
      </p>
      <p>We are not responsible for:</p>
      <ul>
        <li>API outages or data delays</li>
        <li>Platform policy changes</li>
        <li>Data inaccuracies originating from third-party services</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        All software, branding, and original materials associated with Synqlo
        are owned by Synqlo.
      </p>
      <p>Users retain ownership of their own data and content.</p>

      <h2>6. Account Termination</h2>
      <p>Users may delete their account at any time.</p>
      <p>Synqlo reserves the right to suspend or terminate access if:</p>
      <ul>
        <li>These terms are violated</li>
        <li>Required to comply with legal or platform obligations</li>
      </ul>

      <h2>7. Disclaimer</h2>
      <p>Synqlo is provided “as is” without warranties of any kind.</p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Synqlo is not liable for
        indirect or consequential damages arising from use of the service.
      </p>

      <h2>9. Updates to Terms</h2>
      <p>
        We may update these Terms periodically. Continued use constitutes
        acceptance of revised terms.
      </p>

      <h2>10. Contact</h2>
      <p>Email: {supportEmail} </p>
    </div>
  );
}
