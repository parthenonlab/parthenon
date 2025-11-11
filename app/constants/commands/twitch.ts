export const TWITCH_COMMANDS = [
  {
    name: '!commands',
    description: 'Displays the link for the list of all commands',
  },
  {
    name: '!discord',
    description: 'Displays the link for AthenaUS Discord invite',
  },
  {
    name: '!dstmods',
    description: 'Displays the link for AthenaUS DST mods',
  },
  {
    name: '!gamble',
    sub: '<value>',
    description: 'Play your points for a chance to double it',
    note: 'Accepted Values: <positive number> | half | all',
  },
  {
    name: '!give',
    sub: '<@username> <value>',
    description: 'Give your points to another user',
    note: 'Accepted Value: <positive number>',
  },
  {
    name: '!hug',
    sub: '<@username>',
    description: 'Give someone a hug in chat',
  },
  {
    name: '!lurk',
    description: 'Let the chat know when you start lurking',
  },
  {
    name: '!points',
    description: 'View your current balance',
  },
  {
    name: '!steam',
    description: 'Displays the link for AthenaUS Steam',
  },
  {
    name: '!switch',
    description: 'Displays the link for AthenaUS Friend Code',
  },
  {
    name: '!twitter',
    description: 'Displays the link for AthenaUS Twitter',
  },
];
