import { supportEmail, websiteUrl } from "~/constants/details";

export default function PrivacyPolicy() {
  return (
    <div className="p-8 mx-auto">
      <h1>Privacy Policy</h1>
      <p>Last updated: December 18, 2025</p>
      <h2>1. Overview</h2>
      <p>
        Synqlo (“we,” “our,” or “us”) is a creator analytics platform that
        allows users to view performance metrics from connected third-party
        social and content platforms in a single dashboard.
      </p>
      <p>
        We collect and use data only to provide analytics and insights requested
        by the user. We do not sell user data, run ads, or post content on a
        user’s behalf.
      </p>

      <h2>2. Information We Access</h2>
      <h4>a. Account Information</h4>
      <ul>
        <li>Email address</li>
        <li>Basic account identifiers required for authentication</li>
      </ul>
      <h4>b. Connected Platform Data</h4>
      <p>
        When you connect a third-party account (such as YouTube, Instagram,
        Facebook, Threads, or TikTok), Synqlo may access:
      </p>
      <ul>
        <li>
          Public or aggregated analytics metrics (e.g. views, engagement,
          followers, subscribers)
        </li>
        <li>
          Basic account or channel metadata necessary to display analytics
        </li>
      </ul>
      <h4>Synqlo does not:</h4>
      <ul>
        <li>Publish, edit, or delete content</li>
        <li>Send messages or perform actions on your behalf</li>
        <li>Access private messages</li>
        <li>Access passwords</li>
      </ul>

      <h2>3. Platform-Specific Disclosures</h2>
      <h4>Google / YouTube API Disclosure</h4>
      <p>
        Synqlo’s use and transfer of information received from Google APIs
        complies with the Google API Services User Data Policy, including the
        Limited Use requirements.
      </p>
      <ul>
        <li>Data is used solely to display analytics requested by the user</li>
        <li>Data is not used for advertising or profiling</li>
        <li>
          Data is not shared with third parties except as necessary to operate
          the service
        </li>
      </ul>

      <h4>Meta Platforms (Facebook, Instagram, Threads)</h4>
      <p>
        Synqlo accesses Meta platform data only after explicit user
        authorization and only for analytics purposes.
      </p>
      <ul>
        <li>Data is used to display performance insights</li>
        <li>Data is not sold or shared with advertisers</li>
        <li>
          Users may disconnect Meta accounts at any time, which revokes access
        </li>
      </ul>
      <p>
        Synqlo complies with Meta Platform Terms and applicable data protection
        requirements.
      </p>

      <h4>TikTok API Disclosure</h4>
      <p>
        Synqlo accesses TikTok data only after user consent and only for
        analytics display purposes.
      </p>
      <ul>
        <li>Data is used to provide insights into content performance</li>
        <li>
          No data is used for marketing, advertising, or audience targeting
        </li>
        <li>Access can be revoked at any time by the user</li>
      </ul>

      <h2>4. How We Use Data</h2>
      <p>We use connected platform data only to:</p>
      <ul>
        <li>Display analytics and performance insights</li>
        <li>Improve platform reliability and functionality</li>
        <li>Maintain authentication and security</li>
      </ul>
      <p>We do not use data for: </p>
      <ul>
        <li>Advertising</li>
        <li>Behavioral profiling</li>
        <li>Resale or data brokerage </li>
      </ul>

      <h2>5. Data Storage & Retention</h2>
      <ul>
        <li>
          Access tokens are stored securely and encrypted where applicable
        </li>
        <li>
          Data is retained only as long as necessary to provide the service
        </li>
        <li>Disconnected platform data is no longer refreshed</li>
      </ul>
      <p>Users may request full data deletion at any time.</p>

      <h2>6. Data Deletion & User Rights</h2>
      <p>Users may:</p>
      <ul>
        <li>Disconnect any connected platform at any time </li>
        <li>Request deletion of their Synqlo account and associated data </li>
      </ul>
      <p>
        Requests can be submitted by emailing:
        <br />
        {supportEmail}
      </p>
      <p>Data deletion requests are processed within a reasonable timeframe.</p>

      <h2>7. Third-Party Services</h2>
      <p>
        Use of connected platforms is subject to each platform’s own terms and
        privacy policies. Synqlo is not responsible for third-party platform
        changes or outages.
      </p>

      <h2>8. Updates to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Updates will be
        reflected on this page with a revised date.
      </p>

      <h2>9. Contact</h2>
      <p>
        Email: {supportEmail}
        <br />
        Website: {websiteUrl}
      </p>
    </div>
  );
}
