'use client';
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function UploadTagsPage() {
    const [fileData, setFileData] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState({ success: 0, error: 0, logs: [] });
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            // Expected columns: Nome, Telefone, Etiqueta
            const parsedData = data.map(row => ({
                nome: row.Nome || row.nome || row.Name || row.name || '',
                telefone: row.Telefone || row.telefone || row.Phone || row.phone || row.numero || '',
                etiqueta: row.Etiqueta || row.etiqueta || row.Tag || row.tag || ''
            })).filter(row => row.telefone && row.etiqueta);
            
            setFileData(parsedData);
            setResults({ success: 0, error: 0, logs: [] });
            setProgress({ current: 0, total: parsedData.length });
        };
        reader.readAsBinaryString(file);
    };

    const addLog = (msg, type = 'info') => {
        setResults(prev => ({
            ...prev,
            logs: [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev.logs]
        }));
    };

    const startUpload = async () => {
        if (fileData.length === 0) return;
        setUploading(true);
        addLog(`Iniciando envio de ${fileData.length} contatos...`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < fileData.length; i++) {
            const contact = fileData[i];
            try {
                await axios.post('/api/upload-tags', {
                    name: contact.nome,
                    telephone: contact.telefone,
                    tag: contact.etiqueta
                });
                successCount++;
                addLog(`✅ Etiqueta "${contact.etiqueta}" adicionada para ${contact.telefone}`, 'success');
            } catch (err) {
                errorCount++;
                const errMsg = err.response?.data?.error || err.message;
                addLog(`❌ Erro em ${contact.telefone}: ${errMsg}`, 'error');
            }
            
            setProgress({ current: i + 1, total: fileData.length });
            setResults(prev => ({ ...prev, success: successCount, error: errorCount }));
            
            // Pequena pausa para não sobrecarregar
            await new Promise(r => setTimeout(r, 500));
        }

        addLog(`🎉 Processo finalizado! Sucesso: ${successCount} | Erros: ${errorCount}`);
        setUploading(false);
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Upload de Etiquetas</h1>
                <p>Importe uma planilha (Excel ou CSV) para adicionar etiquetas aos contatos no SM Click.</p>
            </header>

            <div className="card glass" style={{ marginBottom: '2rem' }}>
                <h3>1. Selecione a Planilha</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                    A planilha deve conter as colunas: <strong>Nome</strong>, <strong>Telefone</strong> e <strong>Etiqueta</strong>.
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Upload size={18} /> Escolher Arquivo
                    </button>
                    {fileData.length > 0 && !uploading && (
                        <button 
                            className="btn btn-primary" 
                            onClick={startUpload}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <CheckCircle2 size={18} /> Iniciar Envio
                        </button>
                    )}
                </div>
            </div>

            {fileData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Resumo */}
                    <div className="card glass">
                        <h3>Resumo dos Dados</h3>
                        <div style={{ marginTop: '1rem' }}>
                            <p><strong>Total de Contatos:</strong> {fileData.length}</p>
                            
                            {uploading || progress.current > 0 ? (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Progresso</span>
                                        <span>{progress.current} / {progress.total}</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            background: 'var(--accent)', 
                                            height: '100%', 
                                            width: `${(progress.current / progress.total) * 100}%`,
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <span style={{ color: 'var(--success)' }}>✅ {results.success} Sucesso</span>
                                        <span style={{ color: 'var(--danger)' }}>❌ {results.error} Erros</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginTop: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Telefone</th>
                                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Etiqueta</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fileData.slice(0, 50).map((row, i) => (
                                                <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '0.5rem' }}>{row.telefone}</td>
                                                    <td style={{ padding: '0.5rem' }}>{row.etiqueta}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {fileData.length > 50 && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.5rem' }}>Mostrando primeiros 50 contatos...</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="card glass">
                        <h3>Logs da Operação</h3>
                        <div style={{ 
                            background: 'rgba(0,0,0,0.3)', 
                            borderRadius: '8px', 
                            padding: '1rem', 
                            marginTop: '1rem',
                            height: '250px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                        }}>
                            {results.logs.map((log, i) => (
                                <div key={i} style={{ 
                                    marginBottom: '0.25rem',
                                    color: log.type === 'error' ? 'var(--danger)' : log.type === 'success' ? 'var(--success)' : 'var(--text-dim)'
                                }}>
                                    [{log.time}] {log.msg}
                                </div>
                            ))}
                            {results.logs.length === 0 && (
                                <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '2rem' }}>
                                    Os logs aparecerão aqui durante o envio.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
