// ─── Types ───

export type MeetingProvider = "zoom" | "teams";

export type MeetingCreateParams = {
  topic: string;
  startTime: Date;
  durationMinutes: number;
};

export type MeetingResult = {
  provider: MeetingProvider;
  meetingId: string;
  joinUrl: string;
};

export type MeetingCreateResponse =
  | { success: true; data: MeetingResult }
  | { success: false; error: string };

export type MeetingDeleteResponse =
  | { success: true }
  | { success: false; error: string };

// ─── Provider Detection ───

export function getAvailableProviders(): MeetingProvider[] {
  const providers: MeetingProvider[] = [];
  if (
    process.env.ZOOM_ACCOUNT_ID &&
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET
  ) {
    providers.push("zoom");
  }
  if (
    process.env.MS_TENANT_ID &&
    process.env.MS_CLIENT_ID &&
    process.env.MS_CLIENT_SECRET
  ) {
    providers.push("teams");
  }
  return providers;
}

export function isProviderConfigured(provider: MeetingProvider): boolean {
  return getAvailableProviders().includes(provider);
}

// ─── Zoom ───

let _zoomToken: { token: string; expiresAt: number } | null = null;

async function getZoomToken(): Promise<string> {
  if (_zoomToken && _zoomToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return _zoomToken.token;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID!;
  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoom token hatası: ${res.status} ${text}`);
  }

  const data = await res.json();
  _zoomToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return _zoomToken.token;
}

async function createZoomMeeting(
  params: MeetingCreateParams
): Promise<MeetingCreateResponse> {
  try {
    const token = await getZoomToken();
    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.topic,
        type: 2,
        start_time: params.startTime.toISOString(),
        duration: params.durationMinutes,
        timezone: "Europe/Istanbul",
        settings: {
          join_before_host: true,
          waiting_room: false,
          auto_recording: "none",
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        error: `Zoom toplantı oluşturulamadı: ${res.status} ${text}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        provider: "zoom",
        meetingId: String(data.id),
        joinUrl: data.join_url,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Zoom bağlantı hatası",
    };
  }
}

async function deleteZoomMeeting(meetingId: string): Promise<MeetingDeleteResponse> {
  try {
    const token = await getZoomToken();
    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204 || res.status === 404) {
      return { success: true };
    }
    return { success: false, error: `Zoom toplantı silinemedi: ${res.status}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Zoom bağlantı hatası",
    };
  }
}

// ─── Teams ───

let _teamsToken: { token: string; expiresAt: number } | null = null;

async function getTeamsToken(): Promise<string> {
  if (_teamsToken && _teamsToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return _teamsToken.token;
  }

  const tenantId = process.env.MS_TENANT_ID!;
  const clientId = process.env.MS_CLIENT_ID!;
  const clientSecret = process.env.MS_CLIENT_SECRET!;

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Teams token hatası: ${res.status} ${text}`);
  }

  const data = await res.json();
  _teamsToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return _teamsToken.token;
}

async function createTeamsMeeting(
  params: MeetingCreateParams
): Promise<MeetingCreateResponse> {
  try {
    const token = await getTeamsToken();
    const userId = process.env.MS_ORGANIZER_USER_ID!;

    const endTime = new Date(
      params.startTime.getTime() + params.durationMinutes * 60_000
    );

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/onlineMeetings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: params.topic,
          startDateTime: params.startTime.toISOString(),
          endDateTime: endTime.toISOString(),
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        error: `Teams toplantı oluşturulamadı: ${res.status} ${text}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        provider: "teams",
        meetingId: data.id,
        joinUrl: data.joinWebUrl,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Teams bağlantı hatası",
    };
  }
}

async function deleteTeamsMeeting(meetingId: string): Promise<MeetingDeleteResponse> {
  try {
    const token = await getTeamsToken();
    const userId = process.env.MS_ORGANIZER_USER_ID!;
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/onlineMeetings/${meetingId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok || res.status === 204 || res.status === 404) {
      return { success: true };
    }
    return { success: false, error: `Teams toplantı silinemedi: ${res.status}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Teams bağlantı hatası",
    };
  }
}

// ─── Unified Public API ───

export async function createMeeting(
  provider: MeetingProvider,
  params: MeetingCreateParams
): Promise<MeetingCreateResponse> {
  if (!isProviderConfigured(provider)) {
    return { success: false, error: `${provider} yapılandırılmamış` };
  }
  if (provider === "zoom") return createZoomMeeting(params);
  if (provider === "teams") return createTeamsMeeting(params);
  return { success: false, error: "Bilinmeyen sağlayıcı" };
}

export async function deleteMeeting(
  provider: MeetingProvider,
  meetingId: string
): Promise<MeetingDeleteResponse> {
  if (!isProviderConfigured(provider)) {
    return { success: false, error: `${provider} yapılandırılmamış` };
  }
  if (provider === "zoom") return deleteZoomMeeting(meetingId);
  if (provider === "teams") return deleteTeamsMeeting(meetingId);
  return { success: false, error: "Bilinmeyen sağlayıcı" };
}

// ─── Interview Invite Email ───

export function buildInterviewInviteEmail(params: {
  candidateName: string;
  firmName: string;
  position: string;
  interviewDate: string;
  durationMinutes: number;
  meetingLink?: string;
  interviewType: string;
}): string {
  const typeLabel =
    params.interviewType === "online"
      ? "Online"
      : params.interviewType === "face_to_face"
        ? "Yüz Yüze"
        : "Telefon";

  let body = `Sayın ${params.candidateName},\n\n`;
  body += `${params.firmName} firmasının ${params.position} pozisyonu için mülakata davetlisiniz.\n\n`;
  body += `Tarih: ${params.interviewDate}\n`;
  body += `Süre: ${params.durationMinutes} dakika\n`;
  body += `Tür: ${typeLabel}\n`;

  if (params.meetingLink) {
    body += `\nToplantı Linki: ${params.meetingLink}\n`;
  }

  body += `\nİyi görüşmeler dileriz.\n`;
  body += `TalentFlow`;

  return body;
}
