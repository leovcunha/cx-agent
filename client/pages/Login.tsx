import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useEmailPasswordLogin, useEmailPasswordSignUp, useOAuthLogin, useGuestLogin } from '@/hooks/useAuthForms'
import { useTranslation } from 'react-i18next'

// Import the UNMODIFIED form components
import { LoginForm } from '@/components/login-form'
import { SignUpForm } from '@/components/sign-up-form'
import { Button } from '@/components/ui/button'

const LoginPage = () => {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  
  // High-level state to control which view is shown
  const [view, setView] = useState<'login' | 'signup'>('login')

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard')
    }
  }, [session, loading, navigate])

  const loginForm = useEmailPasswordLogin()
  const signUpForm = useEmailPasswordSignUp()
  const { handleGoogleLogin } = useOAuthLogin()
  const { handleGuestLogin, isLoading: guestLoading, error: guestError } = useGuestLogin()
  const { t } = useTranslation()

  if (loading || session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Customer Support Agent
          </h1>
          <p className="mt-2 text-gray-600">
            {view === 'login' ? t('loginSubtitle') : t('signupSubtitle')}
          </p>
        </div>

        {/* --- One-Click Guest Demo Button --- */}
        <div className="space-y-2">
          <Button 
            type="button" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.01]"
            onClick={handleGuestLogin}
            disabled={guestLoading}
          >
            {guestLoading ? "Creating guest session..." : "Try Live Demo (One-Click Guest Access)"}
          </Button>
          {guestError && <p className="text-sm text-red-500 text-center">{guestError}</p>}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or sign in with password</span>
          </div>
        </div>

        {/* --- Conditional rendering controlled by the parent --- */}
        {view === 'login' ? (
          <LoginForm
            email={loginForm.email}
            password={loginForm.password}
            error={loginForm.error}
            isLoading={loginForm.isLoading}
            onEmailChange={(event) => loginForm.setEmail(event.target.value)}
            onPasswordChange={(event) => loginForm.setPassword(event.target.value)}
            onSubmit={loginForm.handleLogin}
          />
        ) : (
          <SignUpForm
            email={signUpForm.email}
            password={signUpForm.password}
            repeatPassword={signUpForm.repeatPassword}
            businessName={signUpForm.businessName}
            businessDescription={signUpForm.businessDescription}
            error={signUpForm.error}
            warning={signUpForm.warning}
            success={signUpForm.success}
            isLoading={signUpForm.isLoading}
            onEmailChange={(event) => signUpForm.setEmail(event.target.value)}
            onPasswordChange={(event) => signUpForm.setPassword(event.target.value)}
            onRepeatPasswordChange={(event) => signUpForm.setRepeatPassword(event.target.value)}
            onBusinessNameChange={(event) => signUpForm.setBusinessName(event.target.value)}
            onBusinessDescriptionChange={(event) => signUpForm.setBusinessDescription(event.target.value)}
            onSubmit={signUpForm.handleSignUp}
          />
        )}

        {/* --- High-level toggle control, managed by the parent --- */}
        <div className="text-center text-sm">
          {view === 'login' ? (
            <>
              {t('noAccount')}{' '}
              <button onClick={() => setView('signup')} className="underline underline-offset-4 font-semibold">
                {t('signupButton')}
              </button>
            </>
          ) : (
            <>
              {t('hasAccount')}{' '}
              <button onClick={() => setView('login')} className="underline underline-offset-4 font-semibold">
                {t('loginButton')}
              </button>
            </>
          )}
        </div>

        {/* Google Login Button */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">{t('orContinueWith')}</span>
          </div>
        </div>
        
        <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
          {t('signInGoogle')}
        </Button>

      </div>
    </div>
  )
}

export default LoginPage
