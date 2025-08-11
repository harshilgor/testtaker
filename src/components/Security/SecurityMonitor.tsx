
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  details: any;
  created_at: string;
  user_id: string;
  ip_address?: string;
}

export const SecurityMonitor: React.FC = () => {
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityEvents();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityEvents = async () => {
    try {
      // Since security_logs table doesn't exist yet, we'll show a placeholder
      // In a real implementation, this would query the actual security logs
      setRecentEvents([]);
      setError('Security logging table not configured yet');
    } catch (err) {
      console.error('Error loading security events:', err);
      setError('Failed to load security events');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'admin_access_check':
        return <Shield className="h-4 w-4" />;
      case 'admin_access_error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'admin_access_revoked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'admin_access_error':
        return 'destructive';
      case 'admin_access_revoked':
        return 'default';
      case 'admin_access_check':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
          <CardDescription>Loading security events...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitor
        </CardTitle>
        <CardDescription>
          Recent security events and admin access logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {recentEvents.length === 0 && !error ? (
          <p className="text-sm text-gray-500">No security events recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {getEventIcon(event.event_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getEventBadgeColor(event.event_type)}>
                      {event.event_type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  {event.details && (
                    <div className="text-sm text-gray-600">
                      {Object.entries(event.details).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
