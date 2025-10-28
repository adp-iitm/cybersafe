import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bell, ShieldAlert, MailWarning, DollarSign, CheckCircle } from 'lucide-react';

interface NotificationItem {
  id: number;
  type: string;
  icon: any;
  message: string;
  time: string;
  status: 'read' | 'unread';
  color: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: 'Fraud Alert',
    icon: ShieldAlert,
    message: 'High-risk transaction detected from an unusual location. Review immediately.',
    time: 'Just now',
    status: 'unread',
    color: 'text-red-500',
  },
  {
    id: 2,
    type: 'Phishing Warning',
    icon: MailWarning,
    message: 'Suspicious email detected from "support@microsoft-update.com". Do not click links.',
    time: '15 minutes ago',
    status: 'unread',
    color: 'text-orange-500',
  },
  {
    id: 3,
    type: 'URL Scan Result',
    icon: CheckCircle,
    message: 'URL "https://yourbank.com" confirmed as legitimate.',
    time: '1 hour ago',
    status: 'read',
    color: 'text-green-500',
  },
  {
    id: 4,
    type: 'Transaction Alert',
    icon: DollarSign,
    message: 'Large transaction of ₹5,00,000 to an unknown vendor. Verify if authorized.',
    time: '3 hours ago',
    status: 'read',
    color: 'text-red-500',
  },
  {
    id: 5,
    type: 'Awareness Update',
    icon: Bell,
    message: 'New guide available: "Protecting Your Digital Identity".',
    time: 'Yesterday',
    status: 'read',
    color: 'text-primary',
  },
];

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
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const Notifications: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);

  // Load from localStorage once
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
        return;
      } catch {}
    }
    setItems(initialNotifications);
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(items));
  }, [items]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, status: 'read' })));
  };

  const toggleRead = (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: n.status === 'read' ? 'unread' : 'read' } : n))
    );
  };

  const loadMore = () => {
    const nextId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const more: NotificationItem[] = [
      {
        id: nextId,
        type: 'Security Tip',
        icon: Bell,
        message: 'Enable two-factor authentication on your accounts for extra security.',
        time: 'Just now',
        status: 'unread',
        color: 'text-primary',
      },
    ];
    setItems((prev) => [...prev, ...more]);
  };

  return (
    <div className="py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-display font-bold text-center text-text mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500"
      >
        Your Notifications
      </motion.h1>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-3xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-3xl font-display font-semibold text-text">Recent Alerts</h2>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-4">
          {items.map((notification) => (
            <motion.div
              key={notification.id}
              variants={itemVariants}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Card className={`p-5 flex items-start space-x-4 ${notification.status === 'unread' ? 'bg-surface-light border-l-4 border-primary' : 'bg-surface'}`}>
                <notification.icon size={24} className={`${notification.color} flex-shrink-0 mt-1`} />
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-text">{notification.type}</h3>
                    <span className="text-xs text-text-light">{notification.time}</span>
                  </div>
                  <p className="text-text-light text-sm mt-1">{notification.message}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleRead(notification.id)}>
                  {notification.status === 'unread' ? 'Mark read' : 'Mark unread'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="md" onClick={loadMore}>
            Load More Notifications
          </Button>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Notifications;
