'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Tag, Trash2, Clock, CheckCircle2 } from 'lucide-react';

export default function History() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/schedules');
      setSchedules(res.data.filter(s => s.status === 'completed' || s.status === 'failed'));
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este agendamento do histórico?')) return;
    try {
      await axios.delete(`/api/schedule/${id}`);
      fetchSchedules();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir histórico.');
    }
  };

  return (
    <div className="fade-in">
      <header>
        <h1>Histórico de Agendamentos</h1>
        <p>Veja os agendamentos que já foram concluídos ou falharam.</p>
      </header>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            <Clock size={24} className="spin-slow" style={{ marginBottom: '1rem' }} />
            <p>Carregando histórico...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Etiqueta</th>
                  <th>Data de Disparo</th>
                  <th>Status</th>
                  <th>Conteúdo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Tag size={14} /> {schedule.tag}
                      </span>
                    </td>
                    <td>{format(new Date(schedule.scheduled_at), 'dd/MM/yyyy HH:mm')}</td>
                    <td>
                      <span className={`status-badge status-${schedule.status}`}>
                        {schedule.status === 'completed' ? 'Concluído' : 'Falhou'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {schedule.content || '(Apenas Anexo)'}
                    </td>
                    <td>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        title="Excluir"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      Nenhum agendamento concluído encontrado no histórico.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
