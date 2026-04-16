import { Metadata } from 'next';

import { Invite } from './invite';

export const metadata: Metadata = {
  title: 'Parthenon | Invite',
  description:
    'Team member invitation. Only authorized users can view this content.',
};

const InvitePage = () => <Invite />;
export default InvitePage;
