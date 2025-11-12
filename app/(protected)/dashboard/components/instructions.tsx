import styles from '../styles/instructions.module.scss';

export const Instructions = ({ code }: { code?: string }) => {
  return (
    <div className={styles.instructions}>
      {code ? (
        <>
          <h2>Link your Discord account!</h2>
          <p className={styles.copyText}>Copy the code below:</p>
          <code className={styles.userCode}>{code}</code>
          <div className={styles.steps}>
            <p>
              In the Discord server, use <code>/link</code> and enter the code.
            </p>
            <p className={styles.note}>
              Note: If you have the same email address, login via Discord and it
              should link automatically. To unlink, use <code>/unlink</code> in
              the server.
            </p>
          </div>
        </>
      ) : (
        <>
          <h2>Link your Twitch account!</h2>
          <div className={styles.steps}>
            <p>Login on this website via Twitch.</p>
            <p>
              If you use the same email address for both platforms, it will link
              automatically. Otherwise, you will be provided a code to submit
              using <code>/link</code> in the server.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
