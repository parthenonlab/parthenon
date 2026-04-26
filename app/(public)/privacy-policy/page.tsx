import { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Parthenon | Privacy Policy',
  description:
    'Learn how we collect, use, and protect your personal information when using our platform.',
};

const Privacy = () => {
  return (
    <div className={styles.privacy}>
      <div className={styles.headline}>
        <h1>PRIVACY POLICY</h1>
        <p>Effective Date: April 27, 2026</p>
      </div>
      <ul className={styles.sections}>
        <li>
          <h2>INTRODUCTION</h2>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and
            protect your information when you use the Parthenon website
            (&quot;Site&quot;) and the Little Owl Discord and Twitch bot
            (&quot;Bot&quot;). By using the Site and Bot, you agree to the
            collection and use of information in accordance with this policy.
          </p>
        </li>
        <li>
          <h2>INFORMATION WE COLLECT</h2>
          <p>We may collect and process the following types of information:</p>
          <ul className={styles.list}>
            <li>
              <p>
                <span>Personal Information</span>: We collect limited user
                information (such as user ID, name, and avatar) solely for
                authentication purposes via{' '}
                <a href="https://clerk.com/" target="_blank">
                  Clerk
                </a>
                . We do not store personal information on our own servers,
                except for the unique user ID provided by Discord and Twitch.
                This ID is used exclusively to verify your identity during login
                and is not used for tracking, profiling, or marketing purposes.
              </p>
            </li>
            <li>
              <p>
                <span>Usage Information</span>: We collect data about your
                interactions with the Site and Bot, such as messages sent,
                commands used, and mini-games played. This information helps us
                improve functionality and user experience.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <h2>COOKIES &amp; SESSION STORAGE</h2>
          <p>
            We use strictly necessary session cookies set by{' '}
            <a href="https://clerk.com/" target="_blank">
              Clerk
            </a>{' '}
            to manage authentication. These cookies are required for the Site to
            function and are not used for tracking or advertising. We also use{' '}
            Session Storage in your browser to avoid duplicate login
            notifications during a single browsing session. This data is never
            transmitted to our servers and is cleared when you close your
            browser tab.
          </p>
        </li>
        <li>
          <h2>HOW WE USE YOUR INFORMATION</h2>
          <p>We use the information we collect to:</p>
          <ul className={styles.list}>
            <li>
              <p>Personalize your experience and respond to your requests.</p>
            </li>
            <li>
              <p>
                Monitor and analyze usage and trends to improve the Site and
                Bot.
              </p>
            </li>
            <li>
              <p>
                Log certain user actions (such as logins, account linking, and
                upgrades) to a private internal Discord channel for
                administrative monitoring.
              </p>
            </li>
            <li>
              <p>
                Prevent and address technical issues and violations of our
                terms.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <h2>SHARING YOUR INFORMATION</h2>
          <p>
            We do not sell or share your personal information with third
            parties, except as necessary to provide our services or as required
            by law. We may share information with:
          </p>
          <ul className={styles.list}>
            <li>
              <p>
                <span>Service Providers</span>: We may share information with
                Clerk for authentication purposes only. Clerk handles user
                information as necessary to facilitate login and account
                management for the Site.
              </p>
            </li>
            <li>
              <p>
                <span>Legal Requirements</span>: We may disclose your
                information if required to do so by law or in response to valid
                requests by public authorities.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <h2>YOUR PRIVACY RIGHTS UNDER CCPA</h2>
          <p>
            If you are a resident of California, United States, you have the
            following rights:
          </p>
          <ul className={styles.list}>
            <li>
              <p>
                <span>Right to Know</span>: You have the right to request
                information about the categories of personal information we have
                collected, the sources from which we collected the personal
                information, the purposes for which we collected it, and the
                categories of third parties with whom we share it.
              </p>
            </li>
            <li>
              <p>
                <span>Right to Delete</span>: You have the right to request that
                we delete personal information that we have collected from you,
                subject to certain exceptions.
              </p>
            </li>
            <li>
              <p>
                <span>Right to Opt-Out</span>: You have the right to opt-out of
                the sale of your personal information, if applicable.
              </p>
            </li>
            <li>
              <p>
                <span>Non-Discrimination</span>: We will not discriminate
                against you for exercising any of your CCPA rights.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <h2>YOUR PRIVACY RIGHTS UNDER GDPR</h2>
          <p>
            If you are a user in the European Union (EU) and European Economic
            Area (EEA), you have the following rights:
          </p>
          <ul className={styles.list}>
            <li>
              <p>
                <span>Right to Access</span>: You have the right to request
                access to your personal information and receive a copy of it.
              </p>
            </li>
            <li>
              <p>
                <span>Right to Rectification</span>: You have the right to
                request the correction of inaccurate or incomplete personal
                information.
              </p>
            </li>
            <li>
              <p>
                <span>Right to Erasure</span>: You have the right to request the
                deletion of your personal information, subject to certain
                exceptions.
              </p>
            </li>
            <li>
              <p>
                <span>Right to Restriction of Processing</span>: You have the
                right to request the restriction of processing of your personal
                data under certain circumstances.
              </p>
            </li>
            <li>
              <p>
                <span>Right to Portability</span>: You have the right to receive
                the personal data concerning you, which you have provided to us,
                in a structured, commonly used, and machine-readable format.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <h2>RESOURCES</h2>
          <p>
            For more information about your privacy rights, please visit the
            following resources:
          </p>
          <ul className={styles.list}>
            <li>
              <p>
                <a
                  href="https://ec.europa.eu/info/law/law-topic/data-protection_en"
                  target="_blank">
                  GDPR Overview (EU/EEA)
                </a>
              </p>
            </li>
            <li>
              <p>
                <a href="https://www.oag.ca.gov/privacy/ccpa" target="_blank">
                  CCPA Guide (California, USA)
                </a>
              </p>
            </li>
          </ul>
        </li>
        <li>
          <h2>DATA SECURITY</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your information from unauthorized access, use, or
            disclosure. However, no method of transmission over the internet or
            electronic storage is 100% secure.
          </p>
        </li>
        <li>
          <h2>DATA RETENTION</h2>
          <p>
            We retain your personal information only for as long as necessary to
            fulfill the purposes for which it was collected and to comply with
            legal obligations.
          </p>
        </li>
        <li>
          <h2>CHANGES TO PRIVACY POLICY</h2>
          <p>
            We may modify this policy at any time. If we do, we will provide
            notice of such changes by posting the updated Privacy Policy on the
            Site. Your continued use of the Site and Bot following the posting
            of changes constitutes your acceptance of such changes.
          </p>
        </li>
        <li>
          <h2>CONTACT INFORMATION</h2>
          <p>
            If you have any questions about this Privacy Policy, please send a
            message to&nbsp;
            <a href="mailto:athena@parthenon.app">athena@parthenon.app</a>.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default Privacy;
