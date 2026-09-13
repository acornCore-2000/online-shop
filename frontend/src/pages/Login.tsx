import { type FormEvent, useState } from 'react'
import api from '../api/api'
import styles from './Login.module.css'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '../lib/getErrorMessage'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const [serverError, setServerError] = useState(false)
  const [emailServerError, setEmailServerError] = useState('')
  const [passwordServerError, setPasswordServerError] = useState('')
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const validEmailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
  const emailError = submitted && !email.trim()
    ? 'This field is required.'
    : submitted && !validEmailPattern.test(email.trim())
      ? 'Please enter a valid email address.'
    : emailServerError
  const passwordError = submitted && !password
    ? 'This field is required.'
    : submitted && password.length < 12
      ? 'Password must be at least 12 characters long'
      : passwordServerError

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setServerMessage('')
    setServerError(false)
    setEmailServerError('')
    setPasswordServerError('')

    if (!email.trim() || !validEmailPattern.test(email.trim()) || password.length < 12) {
      return
    }

    try {
      setIsLoading(true)

      const response = await api.post('/api/login', {
        email,
        password,
      })

      const data = response.data
      
      setServerMessage(data?.message || 'Login was successful')
      queryClient.invalidateQueries({
        queryKey:["currentUser"],
      })
      navigate("/");
    } catch (error) {
  setServerError(true)
  setServerMessage(getErrorMessage(error, 'Something went wrong'))
} finally {
  setIsLoading(false)
}
  }

  return (
    <main className={styles.login}>
      <h1 className={styles.title}>Log in</h1>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>

          <input
            className={`${styles.input} ${emailError ? styles.inputError : ''}`}
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setEmailServerError('')
            }}
            placeholder="example@email.com"
            autoComplete="email"
            required
          />
          {emailError && <p className={styles.error} role="alert">{emailError}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>

          <input
            className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setPasswordServerError('')
            }}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />

          <button
            className={styles.passwordButton}
            type="button"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>

          {passwordError && (
            <p className={styles.error} role="alert">
              {passwordError}
            </p>
          )}
        </div>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>

        {serverMessage && (
          <p className={`${styles.serverMessage} ${serverError ? styles.serverMessageError : ''}`} role={serverError ? "alert" : "status"}>
            {serverMessage}
          </p>
        )}
      </form>

      <p className={styles.signupText}>
        Haven't signed up yet?{' '}
        <a className={styles.signupLink} href="/sign-up">
          Sign up
        </a>
      </p>
    </main>
  )
}