'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, AlertCircle, CheckCircle2, Loader } from 'lucide-react';

const GUIDE_SECTIONS = [
  { id: 'projectOverview', label: 'Project Overview & Mission' },
  { id: 'brandIdentity', label: 'Brand Identity & Voice' },
  { id: 'logoPhilosophy', label: 'Logo Philosophy' },
  { id: 'colorPalette', label: 'Color Palette' },
  { id: 'colorAccessibility', label: 'Color Accessibility Guidelines' },
  { id: 'typography', label: 'Typography & Fonts' },
  { id: 'imageryStyle', label: 'Imagery & Photography Style' },
  { id: 'graphicElements', label: 'Graphic Elements & Patterns' },
  { id: 'brandVoice', label: 'Brand Voice & Tone' },
  { id: 'visualStyleGuide', label: 'Visual Style Guide' },
  { id: 'usageRulesAndDonts', label: 'Usage Rules & Don\'ts' },
  { id: 'web3Section', label: 'Web3 Specific Guidelines' },
  { id: 'appendix', label: 'Appendix & Resources' },
];

interface RevisionRequest {
  sections: string[];
  notes: string;
}

export default function RevisionRequestPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleSection = (sectionId: string) => {
    const newSections = new Set(selectedSections);
    if (newSections.has(sectionId)) {
      newSections.delete(sectionId);
    } else {
      newSections.add(sectionId);
    }
    setSelectedSections(newSections);
  };

  const selectAll = () => {
    if (selectedSections.size === GUIDE_SECTIONS.length) {
      setSelectedSections(new Set());
    } else {
      setSelectedSections(new Set(GUIDE_SECTIONS.map((s) => s.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedSections.size === 0) {
      setError('Please select at least one section to revise');
      return;
    }

    if (notes.trim().length < 10) {
      setError('Please provide at least 10 characters of feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/dashboard/${token}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: Array.from(selectedSections),
          notes: notes.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit revision request');
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push(`/dashboard/${token}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit revision request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Revision Request Submitted!</h1>
          <p className="text-gray-700 mb-6">
            Our team will review your request and regenerate the selected sections within 2-3 business days. You'll
            receive an email when your updated brand guide is ready.
          </p>
          <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/dashboard/${token}`} className="inline-block mb-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Request Brand Guide Revision</h1>
          <p className="text-lg text-slate-600">
            Select which sections of your brand guide you'd like us to regenerate
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Revision Quota Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle>Your Revision Quota</CardTitle>
              <CardDescription>You have 2 revisions included with your order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">Revisions Remaining</span>
                    <span className="text-sm font-bold text-blue-600">2/2</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-4">
                After regeneration, your brand guide version will be updated (e.g., 1.0 → 1.1) and you'll have a
                complete changelog.
              </p>
            </CardContent>
          </Card>

          {/* Section Selection */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Select Sections to Revise</CardTitle>
                  <CardDescription>Choose which parts of your brand guide need updates</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  {selectedSections.size === GUIDE_SECTIONS.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GUIDE_SECTIONS.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.has(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">{section.label}</span>
                  </label>
                ))}
              </div>
              {selectedSections.size > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>{selectedSections.size}</strong> section{selectedSections.size !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revision Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Revision Instructions</CardTitle>
              <CardDescription>Explain what you'd like us to change and why</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
                placeholder="E.g., 'Please make the color palette more vibrant and modern. Our brand identity has shifted toward a more playful aesthetic.'"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {notes.length}/1000 characters (minimum 10 characters required)
              </p>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-900">
                ⏱️ <span className="font-semibold">Revision Timeline:</span> Your updated brand guide will be ready
                within 2-3 business days. You'll receive an email notification when it's complete.
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || selectedSections.size === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Revision Request'
              )}
            </Button>
            <Link href={`/dashboard/${token}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12 text-base">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
