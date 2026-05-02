import { searchProgrammes } from '@/lib/search';
import { latestPosts } from '@/lib/blogDb';
import LandingClient from './components/LandingClient';

export default async function Home() {
  let recommended = [];
  let latest = [];

  try {
    const { ergebnisse } = await searchProgrammes({
      sortBy: 'volumen',
      sortDir: 'desc',
      limit: 3,
      page: 1,
    });
    recommended = ergebnisse || [];
  } catch (e) {
    recommended = [];
  }

  try {
    latest = await latestPosts(3);
  } catch (e) {
    latest = [];
  }

  return <LandingClient recommended={recommended} latestPosts={latest} />;
}
