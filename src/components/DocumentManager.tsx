import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Document {
  id: string;
  claim_id: string;
  type: string;
  file_path: string;
  uploaded_at: string;
}

export function DocumentManager({ claimId }: { claimId: string }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  useEffect(() => {
    fetchDocuments();
  }, [claimId]);

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('claim_documents')
        .select('*')
        .eq('claim_id', claimId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileDrop(acceptedFiles: File[]) {
    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${claimId}/${Date.now()}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('claim-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { error: dbError } = await supabase
          .from('claim_documents')
          .insert([
            {
              claim_id: claimId,
              type: file.type,
              file_path: fileName,
            },
          ]);

        if (dbError) throw dbError;
      }

      toast.success('Documents uploaded successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(document: Document) {
    try {
      const { data, error } = await supabase.storage
        .from('claim-documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_path.split('/').pop() || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download document');
    }
  }

  async function handleDelete(document: Document) {
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    if (!confirmed) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('claim-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('claim_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      setDocuments(documents.filter(d => d.id !== document.id));
    } catch (error) {
      toast.error('Failed to delete document');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-200 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Supported formats: PDF, JPEG, PNG (max 10MB)
        </p>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Documents</h2>
          
          {documents.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {document.file_path.split('/').pop()}
                      </p>
                      <p className="text-sm text-slate-500">
                        Uploaded {formatDate(document.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(document)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}