export type GroupKind = 'all' | 'exchange' | 'mentorship';
export type OrganisationGroup = {
  id: string;
  name: string;
  kind: Exclude<GroupKind, 'all'>;
  title: readonly [string, string];
  description: readonly [string, string];
  location: readonly [string, string];
  website: string;
  contactEmail: string;
  minimumAge: number;
  sessions: readonly { startsAt: string; joinUrl: string }[];
};

// Organisation opportunities, not a directory of individual learners.
// Add times only when supplied and confirmed by the organisation.
export const ORGANISATION_GROUPS: readonly OrganisationGroup[] = [
  {
    id: 'tlt', name: 'Tea Leaf Trust', kind: 'exchange',
    title: ['Tamil & English exchange', 'தமிழ் மற்றும் ஆங்கிலப் பரிமாற்றம்'],
    description: ['Explore organisation-run language practice with Sri Lankan hill-country learners.', 'இலங்கை மலையக மாணவர்களுடன் அமைப்பு நடத்தும் மொழிப் பயிற்சி வாய்ப்புகளை அறியுங்கள்.'],
    location: ['Hill country, Sri Lanka', 'மலையகம், இலங்கை'],
    website: 'https://tealeaftrust.com/contact/', contactEmail: 'info@tealeaftrust.com',
    minimumAge: 18, sessions: [],
  },
  {
    id: 'aram', name: 'Aram', kind: 'mentorship',
    title: ['Virtual mentorship', 'இணைய வழிகாட்டுதல்'],
    description: ['Explore organisation-run mentorship connecting the Tamil diaspora and Sri Lanka.', 'தமிழ்ப் புலம்பெயர் சமூகத்தையும் இலங்கையையும் இணைக்கும் அமைப்பின் வழிகாட்டுதல் வாய்ப்புகளை அறியுங்கள்.'],
    location: ['UK ↔ Sri Lanka', 'பிரிட்டன் ↔ இலங்கை'],
    website: 'https://aram.org.uk/initiatives#mentorship', contactEmail: 'hello@aram.org.uk',
    minimumAge: 18, sessions: [],
  },
];

export function findOrganisationGroups(query: string, kind: GroupKind = 'all') {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return ORGANISATION_GROUPS.filter(group => {
    const text = [group.name, ...group.title, ...group.description, ...group.location].join(' ').toLocaleLowerCase();
    return (kind === 'all' || kind === group.kind) && terms.every(term => text.includes(term));
  });
}

export function organisationEnquiry(group: OrganisationGroup) {
  const subject = `Paalam: ${group.title[0]} enquiry`;
  const body = `Hello ${group.name},\n\nI found your organisation through Paalam and would like to ask about your organisation-run ${group.title[0].toLowerCase()} opportunities for adults aged 18+.\n\nCould you share any available group sessions, eligibility requirements and the next steps to take part?\n\nThank you.`;
  return `mailto:${group.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}