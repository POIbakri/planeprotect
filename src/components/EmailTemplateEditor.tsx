import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { Button } from './ui/button';
import { supabase } from '@/lib/api';
import toast from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  description: string;
  variables: string[];
}

export function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data);
      if (data.length > 0) setSelectedTemplate(data[0]);
    } catch (error) {
      toast.error('Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: selectedTemplate.subject,
          html_content: selectedTemplate.html_content,
          description: selectedTemplate.description,
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;
      toast.success('Template saved successfully');
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!selectedTemplate || !value) return;
    setSelectedTemplate({
      ...selectedTemplate,
      html_content: value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Email Templates</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="flex-1 sm:flex-none rounded-lg border border-slate-200 px-4 py-2"
              value={selectedTemplate?.id}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                if (template) setSelectedTemplate(template);
              }}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <Button
              variant="gradient"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {selectedTemplate && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Subject
              </label>
              <input
                type="text"
                value={selectedTemplate.subject}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  subject: e.target.value,
                })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <input
                type="text"
                value={selectedTemplate.description}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  description: e.target.value,
                })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Available Variables
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables.map((variable) => (
                  <span
                    key={variable}
                    className="px-2 py-1 bg-slate-100 rounded-md text-sm text-slate-700"
                  >
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                HTML Content
              </label>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Editor
                  height="400px"
                  defaultLanguage="html"
                  value={selectedTemplate.html_content}
                  onChange={handleEditorChange}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}