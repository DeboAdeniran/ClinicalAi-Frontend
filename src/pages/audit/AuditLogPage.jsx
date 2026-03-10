import { useState, useEffect } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { listAuditLogs } from '../../services/reportService';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAuditLogs().then(r => setLogs(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <PageHeader title="Audit Log" subtitle="Complete system activity trail" />
      <div className="card p-4 lg:p-5">
        {loading ? <LoadingSpinner /> : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border">
                    {['Timestamp', 'User', 'Patient', 'Action', 'Details', 'IP'].map(h => (
                      <th key={h} className="text-left text-text-muted font-medium py-3 px-2 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-bg-border/50 hover:bg-bg-secondary transition-colors">
                      <td className="py-3 px-2 text-text-muted text-xs font-mono">{formatDateTime(log.createdAt)}</td>
                      <td className="py-3 px-2 text-text-primary text-xs">{log.user?.fullName || '—'}</td>
                      <td className="py-3 px-2 text-text-secondary text-xs">{log.patient?.patientId || '—'}</td>
                      <td className="py-3 px-2"><span className="bg-bg-border text-text-muted text-xs px-2 py-0.5 rounded font-mono">{log.actionType}</span></td>
                      <td className="py-3 px-2 text-text-muted text-xs max-w-xs truncate">{log.actionDetail || '—'}</td>
                      <td className="py-3 px-2 text-text-muted text-xs font-mono">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {logs.map(log => (
                <div key={log.id} className="bg-bg-secondary rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="bg-bg-border text-text-muted text-xs px-2 py-0.5 rounded font-mono">{log.actionType}</span>
                    <span className="text-text-muted text-xs font-mono">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <p className="text-text-primary text-xs">{log.user?.fullName || '—'}</p>
                  {log.actionDetail && <p className="text-text-muted text-xs truncate">{log.actionDetail}</p>}
                </div>
              ))}
            </div>
            {!logs.length && <p className="text-text-muted text-sm text-center py-8">No audit logs found</p>}
          </>
        )}
      </div>
    </PageLayout>
  );
}
