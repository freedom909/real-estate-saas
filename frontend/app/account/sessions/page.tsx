"use client";

import { useQuery } from "@apollo/client/react";
import { MY_SESSIONS, MY_IDENTITIES, MY_SECURITY_EVENTS } from "../../graphql/auth/auth.queries";
import AccountLayout from "../../components/account/AccountLayout";

export default function AccountSessionsPage() {
  return (
    <AccountLayout>
      <AccountSessionsContent />
    </AccountLayout>
  );
}

function AccountSessionsContent() {
  const { data: sessionsData, loading: sessionsLoading } = useQuery<any>(MY_SESSIONS);
  const { data: identitiesData, loading: identitiesLoading } = useQuery<any>(MY_IDENTITIES);
  const { data: eventsData, loading: eventsLoading } = useQuery<any>(MY_SECURITY_EVENTS, {
    variables: { limit: 20 },
  });

  const sessions = sessionsData?.mySessions ?? [];
  const identities = identitiesData?.myIdentities ?? [];
  const events = eventsData?.mySecurityEvents ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sessions & Security</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Active Sessions</h2>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session: any) => (
                <div key={session.id} className="p-3 rounded-lg border hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{session.deviceId || "Unknown Device"}</span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <div>IP: {session.ip || "—"}</div>
                    <div>Last seen: {session.lastSeenAt ? new Date(session.lastSeenAt).toLocaleString() : "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Accounts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Linked Accounts</h2>
          {identitiesLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : identities.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No linked accounts</p>
          ) : (
            <div className="space-y-3">
              {identities.map((identity: any) => (
                <div key={identity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="text-xl">
                    {identity.provider === "google" ? "🔵" : identity.provider === "github" ? "⚫" : "🔗"}
                  </div>
                  <div>
                    <div className="text-sm font-medium capitalize">{identity.provider}</div>
                    <div className="text-xs text-gray-500">{identity.email || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Security Events</h2>
        {eventsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No security events</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event: any) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{event.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{event.ip || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        event.severity === "HIGH" ? "bg-red-100 text-red-700" :
                        event.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {event.severity || "LOW"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
