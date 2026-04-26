import { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Parthenon | Terms of Service',
  description:
    'A detailed overview of our terms and conditions, including user responsibilities and legal disclaimers.',
};

const Terms = () => {
  return (
    <div className={styles.terms}>
      <div className={styles.headline}>
        <h1>TERMS OF SERVICE</h1>
        <p>Effective Date: April 27, 2026</p>
      </div>
      <ul className={styles.sections}>
        <li>
          <h2>ACCEPTANCE OF TERMS</h2>
          <p>
            By using the Parthenon website (&quot;Site&quot;) and the Little Owl
            Discord and Twitch bot (&quot;Bot&quot;), you agree to be bound by
            these Terms of Service (&quot;Terms&quot;). If you do not agree to
            these Terms, you may not use the Site or the Bot.
          </p>
        </li>
        <li>
          <h2>ELIGIBILITY</h2>
          <p>
            To use the Site and Bot, you must be at least 13 years old. By using
            the Site and Bot, you represent and warrant that you meet this age
            requirement.
          </p>
        </li>
        <li>
          <h2>USER LOGIN</h2>
          <p>
            To access certain features of the Site and Bot, you need to log in
            using{' '}
            <a href="https://clerk.com/" target="_blank">
              Clerk
            </a>{' '}
            via Discord or Twitch. You are responsible for maintaining the
            confidentiality of your login information and are fully responsible
            for all activities that occur under your account.
          </p>
        </li>

        <li>
          <h2>ACCOUNT LINKING</h2>
          <p>
            You may connect both a Discord and Twitch account to the Site. If
            both accounts exist separately in our system, linking them will
            combine their virtual currency balances into a single account and
            permanently delete the Twitch-only account. This action is
            irreversible.
          </p>
        </li>
        <li>
          <h2>VIRTUAL CURRENCY</h2>
          <p>
            Users can earn virtual currency (&quot;Currency&quot;) by engaging
            in activities such as sending messages, using slash commands in the
            Discord server, participating in mini-games on the bot, or other
            activities as designated. The Currency has no real-world value and
            cannot be exchanged for real money or goods.
          </p>
        </li>
        <li>
          <h2>USER CONDUCT</h2>
          <p>You agree not to engage in any activity that:</p>
          <ul className={styles.list}>
            <li>
              <p>Violates any law or regulation.</p>
            </li>
            <li>
              <p>
                Infringes on the rights of others, including intellectual
                property rights.
              </p>
            </li>
            <li>
              <p>Is harmful, fraudulent, or deceptive.</p>
            </li>
            <li>
              <p>Interferes with the proper functioning of the Site or Bot.</p>
            </li>
          </ul>
        </li>
        <li>
          <h2>CONTENT</h2>
          <p>
            You are solely responsible for any content you create, upload, or
            share while using the Site and Bot. We do not endorse, support, or
            guarantee the completeness, truthfulness, accuracy, or reliability
            of any content.
          </p>
        </li>
        <li>
          <h2>TERMINATION</h2>
          <p>
            We reserve the right to terminate or suspend your access to the Site
            and Bot at our sole discretion, without notice, for conduct that we
            believe violates these Terms or is harmful to other users of the
            Site and Bot. Any virtual currency accumulated under a terminated or
            suspended account will be forfeited and is not recoverable.
          </p>
        </li>
        <li>
          <h2>DISCLAIMER OF WARRANTIES</h2>
          <p>
            The Site and Bot are provided &quot;as is&quot; and &quot;as
            available&quot; without any warranties of any kind. We do not
            guarantee that the Site and Bot will be uninterrupted or error-free.
          </p>
        </li>
        <li>
          <h2>LIMITATION OF LIABILITY</h2>
          <p>
            To the fullest extent permitted by law, we shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, or any loss of profits or revenues, whether incurred
            directly or indirectly, or any loss of data, use, goodwill, or other
            intangible losses resulting from your use of the Site or Bot.
          </p>
        </li>
        <li>
          <h2>CHANGES TO TERMS</h2>
          <p>
            We may modify these Terms at any time. If we do, we will provide
            notice of such changes by posting the updated Terms on the Site.
            Your continued use of the Site and Bot following the posting of
            changes constitutes your acceptance of such changes.
          </p>
        </li>
        <li>
          <h2>GOVERNING LAW AND JURISDICTION</h2>
          <p>
            These Terms are governed by and construed in accordance with the
            laws of the State of California, United States, without regard to
            its conflict of law principles. Any legal action or proceeding
            arising under these Terms will be brought exclusively in the courts
            located in California, United States, and you hereby irrevocably
            consent to the personal jurisdiction and venue therein.
          </p>
        </li>
        <li>
          <h2>CONTACT INFORMATION</h2>
          <p>
            If you have any questions about these Terms, please send a message
            to&nbsp;
            <a href="mailto:athena@parthenon.app">athena@parthenon.app</a>.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default Terms;
