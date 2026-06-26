'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { RefreshCw, Download, Play, Activity, Clock, Eye, MessageSquare, Trash2, FileText, X } from 'lucide-react';
import { calculateBusinessSeconds } from '../../lib/businessHours';

export default function LeadsMonitoring() {
  const [leadsSubTab, setLeadsSubTab] = useState('active');
  const [leads, setLeads] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clockNow, setClockNow] = useState(Date.now());
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [inspectPayload, setInspectPayload] = useState(null);

  useEffect(() => {
    fetchLeadsData();
    const interval = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeadsData = async () => {
    setIsRefreshing(true);
    try {
      const [leadsRes, logsRes] = await Promise.all([
        axios.get('/api/leads'),
        axios.get('/api/webhook/logs')
      ]);
      setLeads(leadsRes.data || []);
      setWebhookLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error fetching leads data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLeadsData();
  };

  const handleDeleteLead = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta medição? Isso não apaga a conversa no SM Click, apenas o registro no painel.')) return;
    try {
      await axios.delete(`/api/leads/${id}`);
      fetchLeadsData();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir medição.');
    }
  };

  const formatResponseTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  const safeFormat = (dateString, fmt = 'dd/MM/yyyy HH:mm:ss') => {
    try {
      if (!dateString) return '-';
      let d = new Date(dateString);
      // Fallback for timestamps missing Z
      if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('T')) {
          d = new Date(dateString.replace(' ', 'T') + 'Z');
      }
      if (isNaN(d.getTime())) return '-';
      return format(d, fmt);
    } catch (e) {
      return '-';
    }
  };

  const measuredLeads = leads.filter(lead => lead.answered_at && lead.response_time !== null);
  const waitingLeads = leads.filter(lead => !lead.answered_at);
  const avgSeconds = measuredLeads.length > 0
    ? Math.round(measuredLeads.reduce((sum, lead) => sum + Number(lead.response_time || 0), 0) / measuredLeads.length)
    : null;
  const fastestSeconds = measuredLeads.length > 0
    ? Math.min(...measuredLeads.map(lead => Number(lead.response_time || 0)))
    : null;
  const overFiveMinutes = measuredLeads.filter(lead => Number(lead.response_time) > 300).length;

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Monitoramento de Leads</h1>
          <p>
            Calcula o intervalo entre a primeira mensagem do cliente e a primeira mensagem do atendente.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} /> {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1.5rem' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            borderBottom: leadsSubTab === 'active' ? '2px solid var(--accent)' : '2px solid transparent',
            color: leadsSubTab === 'active' ? 'var(--accent)' : 'var(--text-dim)',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: leadsSubTab === 'active' ? 'bold' : 'normal',
            fontSize: '0.95rem'
          }}
          onClick={() => setLeadsSubTab('active')}
        >
          Medições ({leads.length})
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            borderBottom: leadsSubTab === 'logs' ? '2px solid var(--accent)' : '2px solid transparent',
            color: leadsSubTab === 'logs' ? 'var(--accent)' : 'var(--text-dim)',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: leadsSubTab === 'logs' ? 'bold' : 'normal',
            fontSize: '0.95rem'
          }}
          onClick={() => setLeadsSubTab('logs')}
        >
          Logs do Webhook ({webhookLogs.length})
        </button>
      </div>

      {leadsSubTab === 'active' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="card glass">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Total de medições</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{leads.length}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Registros no painel</span>
            </div>
            <div className="card glass" style={{ borderLeft: '3px solid var(--warning)' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Aguardando Atendimento</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--warning)' }}>{waitingLeads.length}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cronômetros em andamento</span>
            </div>
            <div className="card glass" style={{ borderLeft: '3px solid var(--success)' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Tempos Calculados</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--success)' }}>{measuredLeads.length}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Primeira resposta registrada</span>
            </div>
            <div className="card glass" style={{ borderLeft: '3px solid var(--accent)' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Tempo Médio Geral</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--accent)' }}>
                {avgSeconds !== null ? formatResponseTime(avgSeconds) : '-'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Mais rápido: {fastestSeconds !== null ? formatResponseTime(fastestSeconds) : '-'}
              </span>
            </div>
          </div>

          <div className="card glass" style={{ marginBottom: '2rem', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Activity size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>Webhook do SM Click</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                  O evento <strong>new-chat</strong> e as respostas dos atendentes são capturadas pelo endpoint abaixo.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <code style={{ flex: 1, minWidth: '260px', padding: '0.5rem 0.75rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', fontSize: '0.85rem', color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/smclick
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Medições em Aberto e Concluídas</h3>
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Primeira mensagem</th>
                    <th>Recebida em</th>
                    <th>Situação</th>
                    <th>Tempo calculado</th>
                    <th>Atendente</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => {
                    const createdAtStr = lead.created_at;
                    let parsedDate = new Date(createdAtStr);
                    if (typeof createdAtStr === 'string' && !createdAtStr.endsWith('Z') && !createdAtStr.includes('T')) {
                        parsedDate = new Date(createdAtStr.replace(' ', 'T') + 'Z');
                    }
                    const measured = Boolean(lead.answered_at && lead.response_time !== null);
                    const elapsed = measured
                      ? Number(lead.response_time)
                      : calculateBusinessSeconds(isNaN(parsedDate.getTime()) ? new Date() : parsedDate, new Date(clockNow));

                    return (
                      <tr key={lead.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{lead.customer_name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{lead.customer_phone}</span>
                          </div>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.first_message || '-'}
                        </td>
                        <td>{safeFormat(lead.created_at, 'dd/MM/yyyy HH:mm')}</td>
                        <td>
                          <span className={`status-badge ${measured ? 'status-success' : 'status-pending'}`}>
                            {measured ? 'Calculado' : 'Aguardando'}
                          </span>
                        </td>
                        <td>
                          {!measured ? (
                            <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={14} className="spin-slow" /> Em andamento ({formatResponseTime(elapsed)})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatResponseTime(elapsed)}</span>
                          )}
                        </td>
                        <td>
                          {lead.attendant_name || '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => setSelectedLeadDetails(lead)}
                            >
                              <Eye size={12} /> Ver
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                        Nenhuma medição registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h3>Histórico de webhooks recebidos (últimos 100)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Evento</th>
                  <th>Telefone</th>
                  <th>Atendente</th>
                  <th>Processamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {webhookLogs.map(log => (
                  <tr key={log.id}>
                    <td>{safeFormat(log.received_at, 'dd/MM/yyyy HH:mm:ss')}</td>
                    <td>
                      <span className="status-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)' }}>
                        {log.event_type}
                      </span>
                    </td>
                    <td>{log.customer_phone || '-'}</td>
                    <td>{log.attendant_name || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.processing_result || '-'}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => setInspectPayload(log)}
                      >
                        <FileText size={12} /> Inspecionar
                      </button>
                    </td>
                  </tr>
                ))}
                {webhookLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      Nenhum payload recebido.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Conversa do Lead */}
      {selectedLeadDetails && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Detalhes do Lead</h3>
              <button className="btn-icon" onClick={() => setSelectedLeadDetails(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>CLIENTE</span>
                  <strong>{selectedLeadDetails.customer_name}</strong>
                  <span style={{ fontSize: '0.875rem', display: 'block', color: 'var(--accent)' }}>{selectedLeadDetails.customer_phone}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>TEMPO DE RESPOSTA</span>
                  <strong>
                    {selectedLeadDetails.answered_at
                      ? formatResponseTime(selectedLeadDetails.response_time)
                      : 'Aguardando atendimento...'}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '12px 12px 12px 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                    Cliente em {safeFormat(selectedLeadDetails.created_at, 'dd/MM/yyyy HH:mm:ss')}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {selectedLeadDetails.first_message || 'Novo chat iniciado'}
                  </p>
                </div>

                {selectedLeadDetails.answered_at ? (
                  <div style={{ alignSelf: 'flex-end', maxWidth: '85%', background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px 12px 0 12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', display: 'block', marginBottom: '0.25rem', textAlign: 'right' }}>
                      Primeira mensagem do Atendente em {safeFormat(selectedLeadDetails.answered_at, 'dd/MM/yyyy HH:mm:ss')}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                      {selectedLeadDetails.maria_message}
                    </p>
                  </div>
                ) : (
                  <div style={{ alignSelf: 'center', margin: '1rem 0', color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="spin-slow" /> Aguardando atendimento...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspecionar Payload Webhook */}
      {inspectPayload && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Inspeção de Webhook</h3>
              <button className="btn-icon" onClick={() => setInspectPayload(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 0' }}>
              <pre style={{ 
                background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', overflow: 'auto', maxHeight: '350px',
                fontFamily: 'monospace', fontSize: '0.8rem', color: '#34d399', border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(inspectPayload.payload), null, 2);
                  } catch (e) {
                    return `[Formato Inválido] Falha ao analisar JSON.\n\nConteúdo bruto recebido:\n${inspectPayload.payload}`;
                  }
                })()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
