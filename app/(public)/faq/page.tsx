import { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Parthenon | FAQ',
  description:
    'Find quick answers to common questions about accounts, features, and troubleshooting.',
};

const FAQ = () => {
  return (
    <div className={styles.faq}>
      <h1>FREQUENTLY ASKED QUESTIONS</h1>
      <div className={styles.questions}>
        <h2>How can I link my Discord and Twitch accounts?</h2>
        <p>
          If you use the same email for Twitch and Discord, log in via each
          platform on this site to link automatically.
        </p>
        <p>
          Otherwise, if you have different email addresses, follow these steps:
        </p>
        <ol>
          <li>Login on this website via Twitch and copy the code provided</li>
          <li>
            Go to the Discord server and use the <code>/link</code> command and
            paste the code
          </li>
          <li>
            After you submit, you will see a confirmation that your accounts are
            linked
          </li>
        </ol>
        <h2>What if I linked the wrong account?</h2>
        <p>
          In the Discord server, use the <code>/unlink</code> command to unlink
          your accounts. All of your coins will stay in your Discord account and
          your Twitch account will not be associated anymore.
        </p>
        <h2>Can I add Little Owl to my server?</h2>
        <p>
          Sorry, no. The bot is meant to be used privately within the AthenaUS
          community.
        </p>
        <h2>Where can I send feedback or suggestions?</h2>
        <p>
          There is a dedicated channel in our Discord server named #feedback
          where you can make suggestions or discuss your concerns. You can also
          send an email to{' '}
          <a href="mailto:athena@parthenon.app">athena@parthenon.app</a>.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
