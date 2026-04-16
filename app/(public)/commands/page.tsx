import { Metadata } from 'next';

import { Commands } from './commands';

export const metadata: Metadata = {
  title: 'Parthenon | Commands',
  description:
    'Explore a full list of available Discord and Twitch chat commands for interacting with our bot.',
};

const CommandsPage = () => <Commands />;
export default CommandsPage;
