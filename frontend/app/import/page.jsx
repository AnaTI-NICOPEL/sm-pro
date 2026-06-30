'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, X, Clock, CheckCircle2, FileText } from 'lucide-react';

export default function ImportContacts() {
  const [importStatus, setImportStatus] = useState({
    status: 'idle',
    totalContacts: 0,
    contactsProcessed: 0,
    contactsSaved: 0,
    logs: [],
    currentPage: 0,
    totalPages: 0,
    elapsedTime: 0,
    currentBatch: 0,
    totalBatches: 0,
    nextBatchCountdown: 0
  });

  useEffect(() => {
    fetchImportStatus();
    const interval = setInterval(fetchImportStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchImportStatus = async () => {
    try {
      const res = await axios.get('/api/import/status');
      setImportStatus(res.data);
    } catch (error) {
      console.error('Error fetching import status:', error);
    }
  };

  const handleStartImport = async () => {
    if (!confirm('Iniciar a importação em massa de todos os contatos do SM Click? Isso pode levar algum tempo.')) return;
    try {
      await axios.post('/api/import/start');
      fetchImportStatus();
    } catch (error) {
      console.error('Error starting import:', error);
      alert('Erro ao iniciar importação');
    }
  };

  const handlePauseImport = async () => {
    try {
      await axios.post('/api/import/pause');
      fetchImportStatus();
    } catch (error) {
      console.error('Error pausing import:', error);
    }
  };

  const handleResumeImport = async () => {
    try {
      await axios.post('/api/import/resume');
      fetchImportStatus();
    } catch (error) {
      console.error('Error resuming import:', error);
    }
  };

  const handleCancelImport = async () => {
    if (!confirm('Tem certeza que deseja cancelar a importação atual?')) return;
    try {
      await axios.post('/api/import/cancel');
      fetchImportStatus();
    } catch (error) {
      console.error('Error canceling import:', error);
    }
  };

  const formatSeconds = (totalSecs) => {
    const minutes = Math.floor(totalSecs / 60);
    const remainingSecs = totalSecs % 60;
    if (minutes > 0) return `${minutes}m ${remainingSecs}s`;
    return `${remainingSecs}s`;
  };

  const getStatusText = (status) => {
    const map = {
      idle: 'Aguardando',
      running: 'Importando...',
      paused_delay: 'Pausa de Segurança (15s)',
      paused_user: 'Pausado pelo Usuário',
      completed: 'Concluído',
      failed: 'Falha na Importação',
      cancelled: 'Cancelado'
    };
    return map[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    if (['idle', 'paused_user'].includes(status)) return 'status-badge status-pending';
    if (status === 'running') return 'status-badge status-sending';
    if (status === 'paused_delay') return 'status-badge status-warning';
    if (status === 'completed') return 'status-badge status-success';
    return 'status-badge status-failed';
  };

  const progressPercent = importStatus.totalContacts > 0 
    ? Math.min(100, Math.round((importStatus.contactsProcessed / importStatus.totalContacts) * 100)) 
    : 0;

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Importar Contatos do SM Click</h1>
          <p>Busca automática de contatos, filtragem e cadastro no PostgreSQL.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['idle', 'completed', 'failed', 'cancelled'].includes(importStatus.status) ? (
            <>
              <a href="/api/import/report" target="_blank" download="relatorio_importacao.xlsx" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', textDecoration: 'none', background: '#ffffff', color: '#000000', border: '1px solid #e2e8f0', fontWeight: '500' }}>
                <FileText size={18} /> Baixar Relatório
              </a>
              <button className="btn btn-primary" onClick={handleStartImport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <Download size={18} /> Iniciar Importação
              </button>
            </>
          ) : importStatus.status === 'paused_user' ? (
            <>
              <button className="btn btn-primary" onClick={handleResumeImport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <CheckCircle2 size={18} /> Retomar
              </button>
              <button className="btn" onClick={handleCancelImport} style={{ background: 'var(--danger)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <X size={18} /> Interromper
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={handlePauseImport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <Clock size={18} /> Pausar
              </button>
              <button className="btn" onClick={handleCancelImport} style={{ background: 'var(--danger)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <X size={18} /> Interromper
              </button>
            </>
          )}
        </div>
      </header>

      {importStatus.status === 'paused_delay' && (
        <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Clock size={24} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Intervalo de segurança ativo!</strong>
            <span>Aguardando para evitar sobrecarga. Próximo lote de 1000 contatos iniciará em <strong>{formatSeconds(importStatus.nextBatchCountdown)}</strong>.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Status da Importação</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className={getStatusBadgeClass(importStatus.status)} style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
              {getStatusText(importStatus.status)}
            </span>
          </div>
        </div>

        <div className="card glass">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Contatos Analisados</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0' }}>
            {importStatus.contactsProcessed} / {importStatus.totalContacts}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Página {importStatus.currentPage} de {importStatus.totalPages}
          </span>
        </div>

        <div className="card glass">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Contatos Salvos (Com Tags)</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', color: 'var(--success)' }}>
            {importStatus.contactsSaved}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Cadastrados no PostgreSQL
          </span>
        </div>

        <div className="card glass">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Tempo Decorrido</p>
          <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0' }}>
            {formatSeconds(importStatus.elapsedTime)}
          </h2>
        </div>
      </div>

      {importStatus.status !== 'idle' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Progresso Total</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--accent)' }}>{progressPercent}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
            <div 
              style={{ 
                background: 'linear-gradient(90deg, var(--accent) 0%, #38bdf8 100%)', 
                width: `${progressPercent}%`, 
                height: '100%', 
                transition: 'width 0.4s ease' 
              }} 
            />
          </div>
        </div>
      )}

      <div className="card glass">
        <h3 style={{ marginBottom: '1rem' }}>Atividades em Tempo Real</h3>
        <div 
          style={{ 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: '8px', 
            padding: '1rem', 
            fontFamily: 'monospace', 
            fontSize: '0.85rem', 
            height: '250px', 
            overflowY: 'auto', 
            color: '#34d399', 
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column-reverse'
          }}
        >
          {importStatus.logs && importStatus.logs.length > 0 ? (
            importStatus.logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '0.25rem', whiteSpace: 'pre-wrap' }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '5rem 0' }}>
              Nenhuma atividade registrada. Clique em "Iniciar Importação" para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
