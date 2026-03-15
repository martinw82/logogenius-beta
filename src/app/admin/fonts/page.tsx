'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { FontPreview } from '@/components/font-preview';
import { commonFontList } from '@/lib/types/typography';

interface UploadedFont {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

export default function FontsPage() {
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('font', file);

      const response = await fetch('/api/admin/fonts/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadedFonts(prev => [...prev, result.font]);
      setUploadSuccess(`Font "${result.font.name}" uploaded successfully!`);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload font');
    } finally {
      setIsUploading(false);
    }
  };

  const allFonts = [
    ...commonFontList.map(name => ({ name, type: 'system' as const })),
    ...uploadedFonts.map(font => ({ name: font.name, type: 'uploaded' as const, url: font.filePath }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Font Management</h1>
        <p className="text-gray-600">Manage typography fonts for brand guides</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Custom Font
          </CardTitle>
          <CardDescription>
            Upload TTF or OTF font files to use in brand guides. Maximum file size: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Choose Font File
                </>
              )}
            </Button>
            <span className="text-sm text-gray-500">
              Supported formats: TTF, OTF
            </span>
          </div>

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{uploadSuccess}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* System Fonts */}
      <Card>
        <CardHeader>
          <CardTitle>System Fonts ({commonFontList.length})</CardTitle>
          <CardDescription>
            Professional fonts available for all brand guides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonFontList.map((fontName) => (
              <FontPreview
                key={fontName}
                fontName={fontName}
                previewText={`${fontName} - Sample Text`}
                className="h-auto"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Fonts */}
      {uploadedFonts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Fonts ({uploadedFonts.length})</CardTitle>
            <CardDescription>
              Custom fonts uploaded for brand guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFonts.map((font) => (
                <FontPreview
                  key={font.id}
                  fontName={font.name}
                  fontUrl={font.filePath}
                  previewText={`${font.name} - Custom Font`}
                  className="h-auto"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}