
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Info, ExternalLink } from 'lucide-react';

export const AuthSecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    mfaEnabled: false,
    sessionTimeout: '24h',
    passwordStrength: 'medium',
    otpExpiry: '5min'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentication Security
        </CardTitle>
        <CardDescription>
          Configure authentication security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Some security settings need to be configured in the Supabase dashboard under Authentication settings.
            <Button variant="link" className="h-auto p-0 ml-1" asChild>
              <a 
                href="https://supabase.com/dashboard/project/kpcprhkubqhslazlhgad/auth/providers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                Open Auth Settings <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Leaked Password Protection</h4>
              <p className="text-sm text-gray-600">
                Prevent users from using compromised passwords
              </p>
            </div>
            <Badge variant="outline" className="text-orange-600">
              Configure in Supabase
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">OTP Expiry Time</h4>
              <p className="text-sm text-gray-600">
                Currently set to default (reduce for better security)
              </p>
            </div>
            <Badge variant="outline" className="text-orange-600">
              Configure in Supabase
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Session Timeout</h4>
              <p className="text-sm text-gray-600">
                Automatically sign out inactive users
              </p>
            </div>
            <Switch
              checked={settings.sessionTimeout === '24h'}
              onCheckedChange={() => {}}
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Multi-Factor Authentication</h4>
              <p className="text-sm text-gray-600">
                Require additional verification steps
              </p>
            </div>
            <Badge variant="outline" className="text-blue-600">
              Coming Soon
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Security Recommendations</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Enable leaked password protection in Supabase Auth settings</li>
            <li>• Reduce OTP expiry time to 5 minutes or less</li>
            <li>• Consider implementing rate limiting for login attempts</li>
            <li>• Regularly review admin access permissions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
