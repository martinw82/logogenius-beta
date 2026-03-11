'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/dashboard/${token}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push(`/dashboard/${token}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h1>
          <p className="text-gray-700 mb-6">
            Your feedback has been submitted. We appreciate your input and will use it to improve our service.
          </p>
          <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/dashboard/${token}`} className="inline-block mb-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Share Your Feedback</h1>
          <p className="text-lg text-slate-600">
            Help us improve LogoGenius by sharing your experience
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <Card>
            <CardHeader>
              <CardTitle>How would you rate your experience?</CardTitle>
              <CardDescription>We'd love to know what you think about your brand assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-center py-8">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                    aria-label={`Rate ${value} out of 5 stars`}
                  >
                    <Star
                      size={48}
                      className={`transition-colors ${
                        value <= (hoverRating || rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating && (
                <p className="text-center text-sm font-semibold text-slate-900">
                  {rating === 1 && "We're sorry you had a poor experience. Please let us know what went wrong."}
                  {rating === 2 && "We'd like to do better. Your feedback will help us improve."}
                  {rating === 3 && "Thanks for your honesty. Tell us what we can improve."}
                  {rating === 4 && "Great! We're glad you enjoyed your experience."}
                  {rating === 5 && "Excellent! We're thrilled you're happy with your brand!"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Comments (Optional)</CardTitle>
              <CardDescription>
                Share any specific feedback, suggestions, or concerns (max 500 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                placeholder="Tell us more about your experience..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {feedback.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Categories (Optional - for structured feedback) */}
          <Card>
            <CardHeader>
              <CardTitle>What did you like most?</CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'quality', label: 'High quality designs' },
                { id: 'speed', label: 'Fast turnaround' },
                { id: 'customization', label: 'Customization options' },
                { id: 'support', label: 'Customer support' },
                { id: 'ease', label: 'Ease of use' },
                { id: 'value', label: 'Value for money' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked={false}
                  />
                  <span className="text-sm text-slate-700">{item.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !rating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-base"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Link href={`/dashboard/${token}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12 text-base">
                Skip
              </Button>
            </Link>
          </div>
        </form>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700">
              📧 <span className="font-semibold">We read every response!</span> Your feedback helps us create better
              brand experiences. If you'd like us to follow up, mention it in the comments section.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
