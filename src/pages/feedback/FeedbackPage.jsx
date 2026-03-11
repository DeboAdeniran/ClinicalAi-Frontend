import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, Send } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import PageHeader from "../../components/layout/PageHeader";
import api from "../../services/api";

export default function FeedbackPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const recId = searchParams.get("rec") || id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ rating: "", comments: "" });
  const [error, setError] = useState("");

  if (!recId) {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto mt-20 text-center">
          <p className="text-text-muted">
            No recommendation selected. Please access feedback from a
            recommendation page.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary mt-4"
          >
            Go to Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return setError("Please select a rating");
    setError("");
    setLoading(true);
    try {
      await api.post("/feedback", {
        recommendationId: recId,
        rating: form.rating.toUpperCase(),
        comments: form.comments,
      });
      setSubmitted(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const ratings = [
    {
      value: "USEFUL",
      icon: ThumbsUp,
      label: "Useful",
      desc: "Clinically relevant and actionable",
      color: "#39d98a",
    },
    {
      value: "PARTIALLY_USEFUL",
      icon: Minus,
      label: "Partially Useful",
      desc: "Some suggestions needed adjustment",
      color: "#ffa502",
    },
    {
      value: "NOT_USEFUL",
      icon: ThumbsDown,
      label: "Not Useful",
      desc: "Not applicable to this patient",
      color: "#ff4757",
    },
  ];

  if (submitted) {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto mt-20 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 border border-accent-green/30 flex items-center justify-center mx-auto mb-4">
            <ThumbsUp size={28} className="text-accent-green" />
          </div>
          <h2 className="text-text-primary font-bold text-xl mb-2">
            Thank you for your feedback!
          </h2>
          <p className="text-text-muted text-sm">Redirecting to dashboard...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-xl">
        <PageHeader
          title="Submit Feedback"
          subtitle="Help improve AI recommendation quality"
          actions={
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={15} /> Back
            </button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-4 lg:p-5">
            <h3 className="section-title mb-4">
              How useful was this recommendation? *
            </h3>
            <div className="space-y-2">
              {ratings.map(({ value, icon: Icon, label, desc, color }) => (
                <label
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, rating: value }))}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${form.rating === value ? "border-opacity-60 bg-opacity-10" : "border-bg-border bg-bg-secondary hover:border-text-muted"}`}
                  style={
                    form.rating === value
                      ? { borderColor: color, backgroundColor: `${color}15` }
                      : {}
                  }
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold text-sm">
                      {label}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">{desc}</p>
                  </div>
                  {form.rating === value && (
                    <div
                      className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: color }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="card p-4 lg:p-5">
            <label className="label">Additional Comments (optional)</label>
            <textarea
              className="input-field h-28 resize-none"
              placeholder="Clinical concerns, specific issues, suggestions for improvement..."
              value={form.comments}
              onChange={(e) =>
                setForm((f) => ({ ...f, comments: e.target.value }))
              }
            />
          </div>

          {error && <p className="text-risk-high text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={14} /> Submit Feedback
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
