import { searchProgrammes } from '@/lib/search';
import LandingClient from './components/LandingClient';

export default async function Home() {
  let recommended = [];
  try {
    const { ergebnisse } = await searchProgrammes({
      sortBy: 'volumen',
      sortDir: 'desc',
      limit: 4,
      page: 1,
    });
    recommended = ergebnisse || [];
  } catch (e) {
    // Fail soft — landing page still renders without recommended block.
    recommended = [];
  }

  return <LandingClient recommended={recommended} />;
}
