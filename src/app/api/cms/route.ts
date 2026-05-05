import { NextResponse } from 'next/server';
import { getFilms, saveFilms, getTeam, saveTeam, getConfig, saveConfig, getDonationCampaign, saveDonationCampaign, getDonationProjects, saveDonationProjects, getNews, saveNews, getKarshaNuns, saveKarshaNuns, getBreakingTheSilence, saveBreakingTheSilence, getFeaturedFilms, saveFeaturedFilms, getDiscussionTabs, saveDiscussionTabs, getDiscussionMessages, saveDiscussionMessages } from '@/utils/cms';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tabId = searchParams.get('tabId');
    
    if (type === 'films') {
      return NextResponse.json(await getFilms(), { headers: NO_STORE_HEADERS });
    } else if (type === 'team') {
      return NextResponse.json(await getTeam(), { headers: NO_STORE_HEADERS });
    } else if (type === 'config') {
      return NextResponse.json(await getConfig(), { headers: NO_STORE_HEADERS });
    } else if (type === 'donationCampaign') {
      return NextResponse.json(await getDonationCampaign(), { headers: NO_STORE_HEADERS });
    } else if (type === 'donationProjects') {
      return NextResponse.json(await getDonationProjects(), { headers: NO_STORE_HEADERS });
    } else if (type === 'news') {
      return NextResponse.json(await getNews(), { headers: NO_STORE_HEADERS });
    } else if (type === 'karshaNuns') {
      return NextResponse.json(await getKarshaNuns(), { headers: NO_STORE_HEADERS });
    } else if (type === 'breakingTheSilence') {
      return NextResponse.json(await getBreakingTheSilence(), { headers: NO_STORE_HEADERS });
    } else if (type === 'featuredFilms') {
      return NextResponse.json(await getFeaturedFilms(), { headers: NO_STORE_HEADERS });
    } else if (type === 'discussionTabs') {
      return NextResponse.json(await getDiscussionTabs(), { headers: NO_STORE_HEADERS });
    } else if (type === 'discussionMessages') {
      const payload = (await getDiscussionMessages()) as Record<string, any[]>;
      if (tabId) {
        return NextResponse.json({ messages: payload?.[tabId] ?? [] }, { headers: NO_STORE_HEADERS });
      }
      return NextResponse.json(payload, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('API GET error:', error);
    return NextResponse.json({ 
      error: 'Backend Failure', 
      details: error.message || String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tabId = searchParams.get('tabId');
    const body = await request.json();
    
    if (type === 'films') {
      await saveFilms(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'team') {
      await saveTeam(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'config') {
      await saveConfig(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'donationCampaign') {
      await saveDonationCampaign(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'donationProjects') {
      await saveDonationProjects(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'news') {
      await saveNews(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'karshaNuns') {
      await saveKarshaNuns(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'breakingTheSilence') {
      await saveBreakingTheSilence(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'featuredFilms') {
      await saveFeaturedFilms(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'discussionTabs') {
      await saveDiscussionTabs(body);
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    } else if (type === 'discussionMessages') {
      if (tabId || body?.tabId) {
        const messageTabId = tabId ?? body.tabId;
        const payload = await getDiscussionMessages();
        const nextPayload = {
          ...(payload ?? {}),
          [messageTabId]: Array.isArray(body?.messages) ? body.messages : [],
        };
        await saveDiscussionMessages(nextPayload);
      } else {
        await saveDiscussionMessages(body ?? {});
      }
      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
     console.error('API POST error:', error);
     return NextResponse.json({ 
       error: 'Backend Failure', 
       details: error.message || String(error) 
     }, { status: 500 });
  }
}
