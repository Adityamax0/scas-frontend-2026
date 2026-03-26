'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * OperationalAnalytics: Shows performance charts for Sub-Heads.
 * @param {Object} data - { districtPerformance: [], categories: [] }
 */
export default function OperationalAnalytics({ data }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!data || !hasMounted) return null;

  const barData = {
    labels: data.districtPerformance.map((d) => d.district),
    datasets: [
      {
        label: 'Avg Resolution Time (Hours)',
        data: data.districtPerformance.map((d) => d.avgART),
        backgroundColor: 'rgba(45, 106, 79, 0.7)',
        borderColor: 'rgba(45, 106, 79, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: data.categories.map((c) => c.label),
    datasets: [
      {
        data: data.categories.map((c) => c.value),
        backgroundColor: [
          '#ef4444', // Red
          '#3b82f6', // Blue
          '#eab308', // Yellow
          '#10b981', // Green
          '#f97316', // Orange
          '#6366f1', // Indigo
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
      {/* ART Bar Chart */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#1b4332' }}>
          ⏱️ SLA Performance per District
        </h3>
        <div style={{ height: '300px' }}>
          <Bar 
            data={barData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, title: { display: true, text: 'Hours' } } }
            }} 
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#1b4332' }}>
          📊 Issue Category Distribution
        </h3>
        <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
          <Doughnut 
            data={doughnutData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } } }
            }} 
          />
        </div>
      </div>
    </div>
  );
}
