/**
 * Agora Channel Query API
 * Gets real-time channel statistics from Agora servers
 */

interface AgoraChannelUser {
  uid: string;
}

interface AgoraChannelResponse {
  success: boolean;
  data: {
    channel_exist: boolean;
    mode: number; // 1 = communication, 2 = live broadcasting
    total?: number; // total users (deprecated, use broadcasters + audience)
    broadcasters?: number[]; // array of broadcaster UIDs
    audience?: number[]; // array of audience UIDs
    users?: AgoraChannelUser[];
  };
}

/**
 * Query Agora for channel statistics
 * @param channelName - The Agora channel name
 * @returns Number of users currently in the channel (excluding hosts)
 */
export async function getChannelViewerCount(channelName: string): Promise<number> {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const customerId = process.env.AGORA_CUSTOMER_ID;
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET;

  if (!appId || !customerId || !customerSecret) {
    console.error('Missing Agora credentials for channel query');
    return 0;
  }

  try {
    // Agora RESTful API endpoint
    const url = `https://api.agora.io/dev/v1/channel/user/${appId}/${channelName}`;

    // Create Basic Auth header
    const credentials = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');

    console.log('[Agora Channel Query]', {
      channelName,
      url,
      hasCredentials: !!credentials,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[Agora Response]', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agora channel query failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return 0;
    }

    const data: AgoraChannelResponse = await response.json();
    console.log('[Agora Data]', JSON.stringify(data, null, 2));

    if (!data.success || !data.data.channel_exist) {
      console.log('[Agora] Channel does not exist or is empty');
      return 0;
    }

    // Count the audience array - these are the viewers (broadcasters are separate)
    const audienceCount = data.data.audience?.length || 0;
    const broadcasterCount = data.data.broadcasters?.length || 0;

    console.log('[Agora] Calculated viewer count:', {
      audienceCount,
      broadcasterCount,
      totalUsers: audienceCount + broadcasterCount,
    });

    return audienceCount;

  } catch (error) {
    console.error('Error querying Agora channel:', error);
    return 0;
  }
}

/**
 * Update the database with the latest viewer count from Agora
 * @param eventId - The event ID
 * @param channelName - The Agora channel name
 */
export async function syncViewerCount(eventId: string, channelName: string): Promise<number> {
  const count = await getChannelViewerCount(channelName);

  // Update database
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();

    const { error } = await supabase
      .from('live_events')
      .update({ viewerCount: count })
      .eq('id', eventId);

    if (error) {
      console.error('Failed to update viewer count in database:', error);
    }

    return count;
  } catch (error) {
    console.error('Error syncing viewer count:', error);
    return count;
  }
}
