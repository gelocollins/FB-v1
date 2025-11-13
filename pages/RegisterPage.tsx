
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Check if any users exist to determine if this is the first signup
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      const isFirstUser = count === 0;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
            }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // If auth user was created, also create a public profile
      if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: authData.user.email!,
                name: name,
                role: isFirstUser ? 'admin' : 'user'
            });

          if (profileError) {
              // This is a critical error. The auth user exists but the profile doesn't.
              // A production app might try to delete the auth user here for cleanup.
              console.error("Profile creation error:", profileError);
              throw new Error("Failed to create user profile after signup. Please contact support.");
          }
      }

      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        setSuccess("User with this email already exists but requires confirmation. A new confirmation link has been sent.");
      } else {
        setSuccess(`Registration successful! ${isFirstUser ? "You have been made the default administrator." : "Please check your email to confirm your account."}`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        {success && <p className="text-green-500 bg-green-100 p-3 rounded-md">{success}</p>}
        <form onSubmit={handleRegister} className="space-y-6">
           <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-yellow-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
