'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle, Tag, List, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [schedules, setSchedules] = useState([]);
  const [fullLogs, setFullLogs] = useState([]);
  const [logsStats, setLogsStats] = useState({ totalSuccess: 0, totalFailed: 0 });
  const [loading, setLoading] = useState(false);

  const safeFormat = (dateString, fmt = 'dd/MM/yyyy HH:mm:ss') => {
    try {
      if (!dateString) return '-';
      let d = new Date(dateString);
      if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('T')) {
          d = new Date(dateString.replace(' ', 'T') + 'Z');
      }
      if (isNaN(d.getTime())) return '-';
      return format(d, fmt);
    } catch (e) {
      return '-';
    }
  };

  const fetchData = async () => {
    try {
      const [schedulesRes, logsRes] = await Promise.all([
        axios.get('/api/schedules'),
        axios.get('/api/logs')
      ]);
      setSchedules(schedulesRes.data || []);
      setFullLogs(logsRes.data.logs || []);
      setLogsStats({ 
        totalSuccess: logsRes.data.totalSuccess || 0, 
        totalFailed: logsRes.data.totalFailed || 0 
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendNow = async (id) => {
    setLoading(true);
    try {
      await axios.post(`/api/schedule/${id}/send-now`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao forçar envio. Veja o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (id) => {
    if (!confirm('Excluir este agendamento e seus logs?')) return;
    try {
      await axios.delete(`/api/schedule/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir agendamento.');
    }
  };

  const handlePauseSchedule = async (id) => {
    setLoading(true);
    try {
      await axios.post(`/api/schedule/${id}/pause`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao pausar agendamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSchedule = async (id) => {
    setLoading(true);
    try {
      await axios.post(`/api/schedule/${id}/resume`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao retomar agendamento.');
    } finally {
      setLoading(false);
    }
  };

  const sentCount = logsStats.totalSuccess;
  const pendingCount = schedules.filter(s => s.status === 'pending').length;
  const failedCount = logsStats.totalFailed;

  return (
    <div className="fade-in">
      <header>
        <h1>Dashboard</h1>
        <p>Visão geral dos disparos automáticos.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Mensagens Enviadas</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{sentCount}</h2>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Agendamentos Pendentes</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{pendingCount}</h2>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)' }}>
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Falhas de Envio</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{failedCount}</h2>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Últimos Agendamentos</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Etiqueta</th>
              <th>Mensagem</th>
              <th>Data de Disparo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.slice(0, 5).map(schedule => (
              <tr key={schedule.id}>
                <td><span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tag size={14} /> {schedule.tag}</span></td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{schedule.content}</td>
                <td>{safeFormat(schedule.scheduled_at, 'dd/MM/yyyy HH:mm')}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`status-badge status-${schedule.status}`}>{schedule.status}</span>
                    {(schedule.status === 'pending' || schedule.status === 'paused') && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {schedule.status === 'pending' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleSendNow(schedule.id)}
                            disabled={loading}
                          >
                            {loading ? 'Processando...' : 'Enviar Agora'}
                          </button>
                        )}
                        {schedule.status === 'paused' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleResumeSchedule(schedule.id)}
                            disabled={loading}
                          >
                            Retomar
                          </button>
                        )}
                        <button 
                          className="btn btn-icon btn-icon-danger" 
                          title="Cancelar Agendamento"
                          onClick={() => handleCancelSchedule(schedule.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {schedule.status === 'sending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handlePauseSchedule(schedule.id)}
                          disabled={loading}
                        >
                          Pausar
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  Nenhum agendamento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
