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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
  FileCheck,
  ClipboardCheck
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

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Arquivo inválido. Apenas JPG, PNG e WEBP são suportados.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. O tamanho máximo permitido é de 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Upload Action
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Selecione um arquivo de imagem.');
      return;
    }

    if (mediaType !== 'avatar' && !resourceId.trim()) {
      setError('Informe o ID do recurso correspondente.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessResult(null);

    try {
      let result: UploadResult;

      // Routing
      if (mediaType === 'avatar') {
        result = await uploadAvatar(selectedFile);
      } else if (mediaType === 'trip-cover') {
        result = await uploadTripCover(resourceId.trim(), selectedFile);
      } else if (mediaType === 'base-trip-cover') {
        result = await uploadBaseTripCover(resourceId.trim(), selectedFile);
      } else if (mediaType === 'base-attraction') {
        result = await uploadBaseAttractionImage(resourceId.trim(), selectedFile);
      } else {
        result = await uploadBaseRestaurantImage(resourceId.trim(), selectedFile);
      }

      setSuccessResult(result);
      
      // Save to local session history
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        filename: selectedFile.name,
        type: mediaType,
        resourceId: mediaType === 'avatar' ? 'Sua Conta (Admin)' : resourceId.trim(),
        url: result.url,
        size: selectedFile.size,
        createdAt: new Date().toISOString(),
        copied: false
      };

      setUploadHistory(prev => [newHistoryItem, ...prev]);

      // Reset file form fields
      setSelectedFile(null);
      setPreviewUrl(null);
      setResourceId('');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      // Friendlier error messages
      if (err.response?.status === 404) {
        setError('Recurso não encontrado. Verifique se o ID informado existe no banco de dados.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Erro de autenticação. Sessão expirada ou sem permissões administrativas.');
      } else {
        setError(err.response?.data?.message || 'Erro ao realizar upload do arquivo.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Copy Clipboard URL
  const handleCopyUrl = (url: string, id?: string) => {
    navigator.clipboard.writeText(url);
    if (id) {
      setJustCopiedId(id);
      setUploadHistory(prev => prev.map(item => item.id === id ? { ...item, copied: true } : item));
      setTimeout(() => {
        setJustCopiedId(null);
      }, 2000);
    } else {
      alert('URL Copiada para a área de transferência!');
    }
  };

  const getMediaLabel = (type: string) => {
    switch (type) {
      case 'avatar': return 'Avatar do Usuário';
      case 'trip-cover': return 'Capa de Viagem';
      case 'base-trip-cover': return 'Capa de Roteiro Base';
      case 'base-attraction': return 'Imagem da Atração';
      case 'base-restaurant': return 'Imagem do Restaurante';
      default: return type;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#001F5B] font-heading">Gerenciador de Mídias (Media Manager)</h1>
        <p className="text-muted-foreground mt-1">
          Faça upload de fotos de atrações, restaurantes, capas de roteiros e avatares com vinculação automática de IDs.
        </p>
      </div>

      {/* Grid containing Form and Preview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Form panel */}
        <Card className="shadow-xs border-slate-100 md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Media Type Selector */}
                <div className="space-y-2">
                  <Label htmlFor="mediaType" className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Tipo de Mídia / Destino
                  </Label>
                  <select
                    id="mediaType"
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                    value={mediaType}
                    onChange={(e) => {
                      setMediaType(e.target.value as any);
                      setError(null);
                      setSuccessResult(null);
                    }}
                  >
                    <option value="base-trip-cover">Capa de Roteiro Base (BaseTrip)</option>
                    <option value="base-attraction">Imagem de Atração Base (BaseAttraction)</option>
                    <option value="base-restaurant">Imagem de Restaurante Base (BaseRestaurant)</option>
                    <option value="trip-cover">Capa de Viagem Real (Trip)</option>
                    <option value="avatar">Avatar de Conta (Self Avatar)</option>
                  </select>
                </div>

                {/* Resource Database ID */}
                <div className="space-y-2">
                  <Label htmlFor="resourceId" className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    ID do Recurso no Banco
                  </Label>
                  <Input
                    id="resourceId"
                    type="text"
                    disabled={mediaType === 'avatar'}
                    placeholder={
                      mediaType === 'avatar' 
                        ? 'Vinculado automaticamente ao seu Token' 
                        : 'Ex: b2d87e14-df0a-429f-a2e6...'
                    }
                    className="h-10 text-sm focus-visible:ring-[#001F5B]"
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                  />
                  {mediaType !== 'avatar' && (
                    <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                      A imagem enviada irá substituir e atualizar diretamente o campo de imagem do recurso correspondente.
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Drag and Drop zone */}
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Arquivo de Imagem
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-[#001F5B]/30 transition-all duration-200 relative cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-white border border-slate-100 rounded-full text-slate-400 shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-700">Arrastar arquivo ou clique para buscar</p>
                      <p className="text-xs text-slate-400">PNG, JPG, JPEG ou WEBP (Tamanho Máximo: 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Success Result Box */}
              {successResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex gap-2">
                    <FileCheck className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold">Upload Concluído com Sucesso!</p>
                      <p className="text-xs text-emerald-700 mt-0.5">O arquivo foi gravado no servidor e vinculado ao recurso.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs">
                    <span className="font-mono text-slate-600 truncate select-all">{successResult.url}</span>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyUrl(successResult.url)}
                        className="h-7 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar
                      </Button>
                      <a
                        href={successResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-md transition-colors"
                        title="Ver Imagem"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Form actions */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="h-10 px-6 bg-[#001F5B] hover:bg-[#FF6A00] hover:text-white text-white font-bold cursor-pointer transition-all gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Enviar Arquivo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="shadow-xs border-slate-100 h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prévia da Mídia</h3>
          </div>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50/20">
            {previewUrl ? (
              <div className="w-full space-y-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    className="max-w-full max-h-[180px] object-contain"
                  />
                </div>
                <div className="text-xs space-y-1.5 border-t border-slate-200/50 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Nome:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[160px]">{selectedFile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Tamanho:</span>
                    <span className="font-semibold text-slate-700">{selectedFile ? formatSize(selectedFile.size) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">MimeType:</span>
                    <span className="font-semibold text-slate-700 font-mono text-[10px]">{selectedFile?.type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-10">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">Nenhuma imagem selecionada</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                  Busque uma foto ao lado para ver as especificações e a prévia antes de enviar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Local Session History Table */}
      <Card className="shadow-xs border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#001F5B]" />
            <h3 className="font-bold text-slate-800">Uploads Realizados na Sessão</h3>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            Rastreamento de uploads do navegador
          </span>
        </div>

        {uploadHistory.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <FileImage className="w-10 h-10 text-slate-300" />
            <p className="font-semibold text-slate-500">Histórico de uploads vazio</p>
            <p className="text-xs text-slate-400">
              Imagens que você enviar durante esta sessão serão rastreadas aqui para acesso rápido.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 w-[60px] text-center">Miniatura</TableHead>
                  <TableHead className="font-semibold text-slate-700">Nome do Arquivo</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tipo de Mídia</TableHead>
                  <TableHead className="font-semibold text-slate-700">ID de Recurso</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tamanho</TableHead>
                  <TableHead className="font-semibold text-slate-700">Hora Envio</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadHistory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="w-10 h-10 rounded border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-800 text-sm block truncate max-w-[180px]" title={item.filename}>
                        {item.filename}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-600 text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {getMediaLabel(item.type)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 font-medium">
                      {item.resourceId}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs font-medium">
                      {formatSize(item.size)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs font-semibold">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyUrl(item.url, item.id)}
                          className={`h-8 border-slate-200 font-semibold gap-1 cursor-pointer ${
                            item.copied ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {item.copied ? (
                            <>
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copiar URL
                            </>
                          )}
                        </Button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md transition-colors"
                          title="Abrir URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
