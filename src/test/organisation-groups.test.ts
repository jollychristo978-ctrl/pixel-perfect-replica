import { describe, expect, it } from 'vitest';
import { findOrganisationGroups, ORGANISATION_GROUPS, organisationEnquiry } from '@/lib/organisation-groups';

describe('Organisation practice groups', () => {
  it('lists Tea Leaf Trust and Aram, not individual learners', () => {
    expect(ORGANISATION_GROUPS.map(group => group.name)).toEqual(['Tea Leaf Trust', 'Aram']);
  });
  it('keeps organisation opportunities for adults 18+', () => {
    expect(ORGANISATION_GROUPS.map(group => group.minimumAge)).toEqual([18, 18]);
  });
  it('does not invent confirmed session times or joining links', () => {
    expect(ORGANISATION_GROUPS.map(group => group.sessions)).toEqual([[], []]);
  });
  it('searches partner names and Tamil practice descriptions', () => {
    expect(findOrganisationGroups(' aram ').map(group => group.id)).toEqual(['aram']);
    expect(findOrganisationGroups('மலையகம்').map(group => group.id)).toEqual(['tlt']);
    expect(findOrganisationGroups('unknown')).toEqual([]);
  });
  it('combines search with the selected practice type', () => {
    expect(findOrganisationGroups('', 'exchange').map(group => group.id)).toEqual(['tlt']);
    expect(findOrganisationGroups('', 'mentorship').map(group => group.id)).toEqual(['aram']);
    expect(findOrganisationGroups('aram', 'exchange')).toEqual([]);
  });
  it('directs enquiries to the organisation, not a learner', () => {
    const group = ORGANISATION_GROUPS.find(group => group.id === 'aram');
    if (!group) throw new Error('Aram must be present');
    expect(organisationEnquiry(group)).toContain('mailto:hello@aram.org.uk?');
    expect(decodeURIComponent(organisationEnquiry(group))).toContain('adults aged 18+');
  });
});