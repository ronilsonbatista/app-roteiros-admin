'use client';

import React, { useState } from 'react';
import {
  uploadAvatar,
  uploadTripCover,
  uploadBaseTripCover,
  uploadBaseAttractionImage,
  uploadBaseRestaurantImage,
  UploadResult
} from '@/services/media.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  FileImage,
  Clock,
  ExternalLink,
  Loader2,
  FileCheck
} from 'lucide-react';

interface HistoryItem {
  id: string;
  filename: string;
  type: string;
  resourceId: string;
  url: string;
  size: number;
  createdAt: string;
  copied: boolean;
}

export default function MediaManagerPage() {
  const [mediaType, setMediaType] = useState<'avatar' | 'trip-cover' | 'base-trip-cover' | 'base-attraction' | 'base-restaurant'>('base-trip-cover');
  const [resourceId, setResourceId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<UploadResult | null>(null);
  
  // History Tracker
  const [uploadHistory, setUploadHistory] = useState<HistoryItem[]>([]);
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);

  // File Picker Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessResult(null);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const file = files[0];
    
    // Validations
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Arquivo inválido. Apenas JPG, PNG e WEBP são suportados.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. O tamanho máximo permitido é de 5MB.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Selecione uma imagem para realizar o upload.');
      return;
    }

    if (mediaType !== 'avatar' && !resourceId.trim()) {
      setError('Informe o ID do recurso (Viagem, Roteiro Base ou Atração).');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessResult(null);

    try {
      let result: UploadResult;

      switch (mediaType) {
        case 'avatar':
          result = await uploadAvatar(selectedFile);
          break;
        case 'trip-cover':
          result = await uploadTripCover(resourceId.trim(), selectedFile);
          break;
        case 'base-trip-cover':
          result = await uploadBaseTripCover(resourceId.trim(), selectedFile);
          break;
        case 'base-attraction':
          result = await uploadBaseAttractionImage(resourceId.trim(), selectedFile);
          break;
        case 'base-restaurant':
          result = await uploadBaseRestaurantImage(resourceId.trim(), selectedFile);
          break;
      }

      setSuccessResult(result);

      // Add to session history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        filename: selectedFile.name,
        type: mediaType,
        resourceId: resourceId.trim() || 'global',
        url: result.url,
        size: selectedFile.size,
        createdAt: new Date().toISOString(),
        copied: false,
      };

      setUploadHistory((prev) => [newItem, ...prev]);

      // Reset selection
      setSelectedFile(null);
      setPreviewUrl(null);
      const inputEl = document.getElementById('media-file-input') as HTMLInputElement;
      if (inputEl) inputEl.value = '';
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Erro ao realizar o upload do arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setJustCopiedId(id);
    setTimeout(() => setJustCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="SISTEMA & MÍDIA"
        title="Gestor de Mídias & Uploads"
        subtitle="Gerenciamento e upload de capas de roteiro, imagens de atrações e avatares do ecossistema 2GO"
        breadcrumbs={[
          { label: 'Sistema', href: '/system' },
          { label: 'Mídias' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Form Card */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#001F5B]" />
                Upload de Nova Imagem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Formatos aceitos: JPG, PNG, WEBP (Máx 5MB)</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tipo de Mídia *</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="base-trip-cover">Capa de Roteiro Base (Base Trip Cover)</option>
                  <option value="trip-cover">Capa de Viagem do Usuário (Trip Cover)</option>
                  <option value="base-attraction">Imagem de Atração Turística</option>
                  <option value="base-restaurant">Imagem de Restaurante / Gastronomia</option>
                  <option value="avatar">Avatar de Usuário</option>
                </select>
              </div>

              {mediaType !== 'avatar' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">ID do Recurso Vinculado *</label>
                  <Input
                    type="text"
                    placeholder="Cole o ID do roteiro ou atração..."
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    required
                    className="text-xs h-9 bg-slate-50 font-mono"
                  />
                </div>
              )}

              {/* File Input */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Arquivo de Imagem *</label>
                <input
                  id="media-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#001F5B]/10 file:text-[#001F5B] hover:file:bg-[#001F5B]/20 cursor-pointer"
                />
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center gap-3">
                  <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-slate-200" />
                  <div className="text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-900 truncate max-w-[200px]">{selectedFile?.name}</p>
                    <p>{selectedFile ? formatFileSize(selectedFile.size) : ''}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successResult && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Upload Concluído!
                  </div>
                  <p className="font-mono text-[10px] break-all">{successResult.url}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                {isUploading ? 'Enviando Arquivo...' : 'Enviar Mídia'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Upload History (Right Column: 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#001F5B]" />
                Histórico de Uploads nesta Sessão ({uploadHistory.length})
              </h3>
            </div>

            {uploadHistory.length === 0 ? (
              <EmptyState
                icon={FileImage}
                title="Nenhuma mídia enviada nesta sessão"
                description="Os arquivos enviados aparecerão aqui com link direto para cópia da URL."
              />
            ) : (
              <div className="space-y-3">
                {uploadHistory.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-lg flex items-center justify-between gap-3 hover:bg-white hover:shadow-2xs transition-all text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.url} alt={item.filename} className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.filename}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.type} • {formatFileSize(item.size)}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{item.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(item.url, item.id)}
                        className="text-xs h-8 px-2.5 bg-white border-slate-200 text-slate-700"
                      >
                        {justCopiedId === item.id ? (
                          <span className="flex items-center text-emerald-600 font-bold"><Check className="w-3.5 h-3.5 mr-1" /> Copiado!</span>
                        ) : (
                          <span className="flex items-center"><Copy className="w-3.5 h-3.5 mr-1" /> Copiar URL</span>
                        )}
                      </Button>
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
