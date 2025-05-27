
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginSignupProps {
  onLogin: (userData: any) => void;
}

const LoginSignup: React.FC<LoginSignupProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });

  const handleGoogleAuth = () => {
    // TODO: Implement Google Auth integration
    console.log('Google Auth clicked');
    // For now, simulate successful login
    const mockGoogleUser = {
      id: 'google_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      provider: 'google'
    };
    onLogin(mockGoogleUser);
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginMode) {
      // Login validation
      if (!formData.username || !formData.password) {
        alert('Please fill in username and password');
        return;
      }
      
      const loginUser = {
        id: 'manual_' + Date.now(),
        username: formData.username,
        name: formData.username,
        provider: 'manual'
      };
      onLogin(loginUser);
    } else {
      // Signup validation
      if (!formData.username || !formData.name || !formData.email || !formData.password) {
        alert('Please fill in all fields');
        return;
      }
      
      const signupUser = {
        id: 'manual_' + Date.now(),
        username: formData.username,
        name: formData.name,
        email: formData.email,
        provider: 'manual'
      };
      onLogin(signupUser);
    }
    
    setIsOpen(false);
    setFormData({ username: '', name: '', email: '', password: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ username: '', name: '', email: '', password: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2"
          onClick={() => setIsOpen(true)}
        >
          <LogIn className="h-4 w-4" />
          <span>Login / Sign Up</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLoginMode ? 'Login to Your Account' : 'Create New Account'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Google Auth Button */}
          <Button 
            onClick={handleGoogleAuth}
            variant="outline" 
            className="w-full flex items-center justify-center space-x-2 border-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </Button>
          
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          {/* Manual Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
            />
            
            {!isLoginMode && (
              <>
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </>
            )}
            
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
            
            <Button type="submit" className="w-full">
              {isLoginMode ? 'Login' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              {isLoginMode 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Login"
              }
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginSignup;
