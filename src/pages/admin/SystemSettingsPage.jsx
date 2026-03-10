import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/layout/PageHeader';
export default function SystemSettingsPage() {
  return (
    <PageLayout>
      <PageHeader title="System Settings" subtitle="Configure system parameters and thresholds" />
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {[['High Risk Threshold', '0.70', 'Minimum score to classify patient as high risk'],
          ['Moderate Risk Threshold', '0.40', 'Minimum score for moderate risk classification'],
          ['AI Service URL', 'http://localhost:5001/api', 'URL of the Python AI microservice'],
          ['Model Version', 'rf-v2.1.0', 'Current Random Forest model version'],
        ].map(([label, value, hint]) => (
          <div key={label} className="card p-4">
            <label className="label">{label}</label>
            <input className="input-field" defaultValue={value} />
            <p className="text-text-muted text-xs mt-1">{hint}</p>
          </div>
        ))}
        <div className="col-span-2"><button className="btn-primary">Save Settings</button></div>
      </div>
    </PageLayout>
  );
}
