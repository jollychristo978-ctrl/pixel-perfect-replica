import {createFileRoute} from '@tanstack/react-router';
import {useSuspenseQuery} from '@tanstack/react-query';
import {accountOptions} from '@/lib/paalam.queries';
import {meta} from '@/lib/paalam';
import {ProfileForm} from '@/components/paalam/profile-form';
export const Route=createFileRoute('/_authenticated/onboarding')({head:()=>meta('Your profile','Introduce yourself to the Paalam community and choose your learning language.'),loader:({context})=>context.queryClient.ensureQueryData(accountOptions),component:Onboarding});
function Onboarding(){const {data}=useSuspenseQuery(accountOptions);return <main className="form-page"><ProfileForm profile={data.profile}/></main>}
