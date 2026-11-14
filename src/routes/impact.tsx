import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { impactOptions } from '@/lib/paalam.queries';
import { meta } from '@/lib/paalam';
import { usePaalam } from '@/components/paalam/context';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/impact')({
  head: () => meta('Impact', 'Live totals from the Paalam bridge: bricks laid, bridges completed, calls held and students helped.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(impactOptions),
  component: Impact,
});

const GOAL = 500;

function Impact() {
  const { data } = useSuspenseQuery(impactOptions);
  const { t } = usePaalam();
  const bridges = Math.floor(data.bricks / GOAL);

  const stats = [
    { value: data.bricks.toLocaleString(), label: t('Bricks laid', 'அமைக்கப்பட்ட செங்கற்கள்') },
    { value: bridges.toLocaleString(), label: t('Bridges completed', 'நிறைவடைந்த பாலங்கள்') },
    { value: data.calls_held.toLocaleString(), label: t('Calls held', 'நடைபெற்ற அழைப்புகள்') },
    { value: data.students_helped.toLocaleString(), label: t('Students helped', 'உதவி பெற்ற மாணவர்கள்') },
    { value: data.lessons_unlocked.toLocaleString(), label: t('Lessons unlocked', 'திறக்கப்பட்ட பாடங்கள்') },
  ];

  return (
    <main className="impact-page">
      <section className="shell impact-hero">
        <p className="eyebrow">{t('LIVE IMPACT', 'நேரடி தாக்கம்')}</p>
        <h1>{t('Your learning funds theirs.', 'உங்கள் கற்றல் அவர்களுடையதை முன்னேற்றுகிறது.')}</h1>
        <p className="hero-copy">
          {t(
            'Paalam turns your scroll into Tamil lessons — and every word you learn funds a real English lesson for a student in Sri Lanka.',
            'பாலம் உங்கள் ஸ்க்ரோலை தமிழ் பாடங்களாக மாற்றுகிறது — நீங்கள் கற்கும் ஒவ்வொரு சொல்லும் இலங்கை மாணவருக்கு உண்மையான ஆங்கிலப் பாடமாக மாறுகிறது.',
          )}
        </p>
      </section>
      <section className="shell impact-grid">
        {stats.map((s) => (
          <div className="impact-card" key={s.label}>
            <p className="impact-num">{s.value}</p>
            <p className="subtext">{s.label}</p>
          </div>
        ))}
      </section>
      <section className="shell text-center pb-12">
        <Button asChild>
          <Link to="/auth" search={{ learn: 'Tamil', mode: 'signup' }}>
            {t('Start laying bricks', 'செங்கல் அமைக்கத் தொடங்குங்கள்')}
            <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
    </main>
  );
}
