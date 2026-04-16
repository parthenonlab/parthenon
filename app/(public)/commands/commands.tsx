'use client';

import { useState } from 'react';

import { DISCORD_COMMANDS, TWITCH_COMMANDS } from '@/constants/commands';
import { DiscordIcon, TwitchIcon } from '@/images/icons';

import styles from './page.module.scss';

export const Commands = () => {
  const [mobileDisplay, setMobileDisplay] = useState<'discord' | 'twitch'>(
    'discord'
  );

  const discordClass =
    mobileDisplay === 'discord' ? `${styles.box} ${styles.mobile}` : styles.box;
  const twitchClass =
    mobileDisplay === 'twitch' ? `${styles.box} ${styles.mobile}` : styles.box;

  const handleSwitch = () => {
    setMobileDisplay(prev => (prev === 'discord' ? 'twitch' : 'discord'));
  };

  return (
    <div className={styles.commands}>
      <h1>COMMANDS</h1>
      <div className={styles.toggle}>
        <DiscordIcon />
        <div className={styles.switch}>
          <input type="checkbox" id="switch" />
          <label htmlFor="switch" onClick={handleSwitch} />
        </div>
        <TwitchIcon />
      </div>
      <div className={styles.boxes}>
        <div className={discordClass}>
          <h2>
            <span>DISCORD</span>
            <DiscordIcon />
          </h2>
          <ul className={styles.list}>
            {DISCORD_COMMANDS.map((command, i) => (
              <li key={i}>
                <h3>
                  {command.name}
                  {command.sub && <span>{command.sub}</span>}
                </h3>
                <p>{command.description}</p>
                {command.note && <p className={styles.note}>{command.note}</p>}
              </li>
            ))}
          </ul>
        </div>
        <div className={twitchClass}>
          <h2>
            <span>TWITCH</span>
            <TwitchIcon />
          </h2>
          <ul className={styles.list}>
            {TWITCH_COMMANDS.map((command, i) => (
              <li key={i}>
                <h3>
                  {command.name}
                  {command.sub && <span>{command.sub}</span>}
                </h3>
                <p>{command.description}</p>
                {command.note && <p className={styles.note}>{command.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
