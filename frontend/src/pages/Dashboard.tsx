import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import { BarChart2, Bell, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { GSAPAnimations } from '../utils/gsapAnimations';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const dashboardStats = [
  {
    title: 'URLs Checked',
    value: '1,245',
    icon: ShieldCheck,
    color: 'text-primary',
    trend: '+12% last month',
  },
  {
    title: 'Emails Scanned',
    value: '876',
    icon: Bell,
    color: 'text-secondary',
    trend: '+8% last month',
  },
  {
    title: 'Transactions Analyzed',
    value: '321',
    icon: TrendingUp,
    color: 'text-accent',
    trend: '+15% last month',
  },
  {
    title: 'Fraud Alerts',
    value: '14',
    icon: AlertTriangle,
    color: 'text-red-500',
    trend: '-5% last month',
  },
].slice(0, 10); // Limit to 10 items

const recentActivity = [
  {
    type: 'URL Check',
    description: 'Detected phishing attempt on "malicious-site.com"',
    time: '2 hours ago',
    status: 'Fraudulent',
    color: 'text-red-500',
  },
  {
    type: 'Email Scan',
    description: 'Legitimate email from "support@cybersafe.ai"',
    time: '5 hours ago',
    status: 'Legit',
    color: 'text-green-500',
  },
  {
    type: 'Transaction Check',
    description: 'High-risk transaction from Nigeria',
    time: '1 day ago',
    status: 'Fraudulent',
    color: 'text-red-500',
  },
  {
    type: 'URL Check',
    description: 'Legitimate site "google.com"',
    time: '2 days ago',
    status: 'Legit',
    color: 'text-green-500',
  },
  {
    type: 'Email Scan',
    description: 'Suspicious email regarding "urgent account update"',
    time: '3 days ago',
    status: 'Phishing',
    color: 'text-red-500',
  },
].slice(0, 10); // Limit to 10 items

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Chart data configurations
const fraudTrendsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Phishing Attempts',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 2,
    },
    {
      label: 'Email Scams',
      data: [2, 3, 20, 5, 1, 4],
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 2,
    },
    {
      label: 'Transaction Fraud',
      data: [3, 10, 13, 15, 22, 30],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
    },
  ],
};

const fraudTypesData = {
  labels: ['Phishing', 'Email Scams', 'Transaction Fraud', 'Other'],
  datasets: [
    {
      data: [45, 25, 20, 10],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(156, 163, 175, 0.8)',
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(156, 163, 175, 1)',
      ],
      borderWidth: 2,
    },
  ],
};

const detectionAccuracyData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  datasets: [
    {
      label: 'Detection Accuracy (%)',
      data: [85, 87, 89, 92, 94, 96],
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  },
};

const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    GSAPAnimations.init();
  }, []);

  return (
    <div ref={dashboardRef} className="py-8 page-content">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-display font-bold text-center text-text mb-12 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500"
      >
        Your Security Dashboard
      </motion.h1>

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-16"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-display font-semibold text-text mb-8 text-center"
        >
          Overview
        </motion.h2>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <Card className="p-6 flex flex-col items-center text-center">
                <div className={`p-3 rounded-full bg-opacity-10 ${stat.color.replace('text-', 'bg-')} mb-4`}>
                  <stat.icon size={32} className={stat.color} />
                </div>
                <h3 className="text-lg font-semibold text-text mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-text mb-2">{stat.value}</p>
                <p className="text-sm text-text-light">{stat.trend}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Recent Activity Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-16"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-display font-semibold text-text mb-8 text-center"
        >
          Recent Activity
        </motion.h2>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text mb-4">Latest Alerts</h3>
            <ul className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    {activity.status === 'Fraudulent' || activity.status === 'Phishing' ? (
                      <AlertTriangle size={20} className="text-red-500" />
                    ) : (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-text">{activity.description}</p>
                      <p className="text-sm text-text-light">{activity.type} - {activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${activity.color}`}>
                    {activity.status}
                  </span>
                </motion.li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text mb-4">Fraud Trends</h3>
            <div className="h-64">
              <Bar data={fraudTrendsData} options={chartOptions} />
            </div>
          </Card>
        </motion.div>
      </motion.section>

      {/* Charts Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-16"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-display font-semibold text-text mb-8 text-center text-reveal"
        >
          Analytics & Insights
        </motion.h2>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text mb-4">Fraud Types Distribution</h3>
            <div className="h-64">
              <Doughnut data={fraudTypesData} options={doughnutOptions} />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-text mb-4">Detection Accuracy Trend</h3>
            <div className="h-64">
              <Line data={detectionAccuracyData} options={chartOptions} />
            </div>
          </Card>
        </motion.div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-3xl font-display font-semibold text-text mb-4">Stay Vigilant</h2>
        <p className="text-lg text-text-light mb-8">
          Regularly check your dashboard for the latest security insights and alerts.
        </p>
      </motion.section>
    </div>
  );
};

export default Dashboard;
