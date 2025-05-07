import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setMessage('Invalid verification link');
        setIsError(true);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/verify-email?token=${token}`
        );
        const result = await response.json();
        
        if (response.ok) {
          setMessage(result.message || 'Email verified successfully!');
          setTimeout(() => navigate('/'), 3000); // Redirect after 3 sec
        } else {
          setMessage(result.error || 'Verification failed');
          setIsError(true);
        }
      } catch (err) {
        setMessage('Network error during verification');
        setIsError(true);
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className={`max-w-md w-full p-8 rounded-lg shadow-md text-center ${
        isError ? 'bg-red-50 text-red-700' : 'bg-white'
      }`}>
        <h2 className="text-2xl font-bold mb-4">
          {isError ? 'Verification Error' : 'Verifying Email'}
        </h2>
        <p>{message}</p>
        {isError && (
          <button
            onClick={() => navigate('/signin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;