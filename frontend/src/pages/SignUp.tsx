import { type FormEvent, useMemo, useState } from 'react';
import api from '../api/api';
import axios from "axios";
import styles from './Signup.module.css';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const [serverError, setServerError] = useState(false)
  const [emailServerError, setEmailServerError] = useState('')
const queryClient = useQueryClient();
const navigate = useNavigate();
  const validEmailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

  const passwordStrength = useMemo(() => {
    let score = 0

    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return 'weak'
    if (score <= 4) return 'medium'
    return 'strong'
  }, [password])

  const emailError = submitted && !email.trim()
    ? 'This field is required.'
    : submitted && !validEmailPattern.test(email.trim())
      ? 'Please enter a valid email address.'
    : emailServerError
  const fullnameError = submitted && !fullname.trim() ? 'This field is required.' : ''
  const passwordError = submitted && !password
    ? 'This field is required.'
    : submitted && password.length < 12
      ? 'Password must be at least 12 characters long'
      : ''

  const confirmPasswordError = submitted && !confirmPassword
    ? 'This field is required.'
    : submitted && password !== confirmPassword
      ? 'Passwords do not match'
      : ''

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setServerMessage('')
    setServerError(false)
    setEmailServerError('')

    if (
      !email.trim() ||
      !validEmailPattern.test(email.trim()) ||
      !fullname.trim() ||
      password.length < 12 ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      return
    }

    try {
      setIsLoading(true)

      const response = await api.post('/api/signup', {
        email,
        password, fullname
      })

      const data = response.data

      if (!response) {
        throw new Error(data?.message || 'Signup failed')
      }

      if(data.success){
                    queryClient.invalidateQueries({
                queryKey:["currentUser"],
              })
        navigate("/")
      }

     
    } catch (error) {
  setServerError(true)
  if (axios.isAxiosError(error)) {
    console.log("ERROR DATA:", error.response?.data);
    console.log("ERROR FIELD:", error.response?.data?.error);

    const message = error.response?.data?.message || error.response?.data?.error;
    if (error.response?.status === 409) {
      setEmailServerError(message || "Email already exists.");
    } else {
      setServerMessage(message || "Something went wrong");
    }
  } else {
    setServerMessage("Something went wrong");
  }
} finally {
      setIsLoading(false)
    }}

  return (
    <main className={styles.signup}>
      <h1 className={styles.title}>Create your account</h1>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
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
          <label className={styles.label} htmlFor="fullname">
            Full name
          </label>
          <input
            className={`${styles.input} ${fullnameError ? styles.inputError : ''}`}
            id="fullname"
            type="text"
            value={fullname}
            onChange={(event) => setFullname(event.target.value)}
            placeholder="e.g. John Doe"
            autoComplete="name"
            required
          />
          {fullnameError && <p className={styles.error} role="alert">{fullnameError}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Create a password"
            required
          />

          <button
            className={styles.passwordButton}
            type="button"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>

          {password && (
            <p className={styles.passwordStrength}>
              Password strength:{' '}
              {passwordStrength === 'weak' && 'Weak'}
              {passwordStrength === 'medium' && 'Medium'}
              {passwordStrength === 'strong' && 'Strong'}
            </p>
          )}

          {passwordError && (
            <p className={styles.error} role="alert">{passwordError}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
          <input
            className={`${styles.input} ${confirmPasswordError ? styles.inputError : ''}`}
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Repeat your password"
            required
          />

          <button
            className={styles.passwordButton}
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>

          {confirmPasswordError && (
            <p className={styles.error} role="alert">
              {confirmPasswordError}
            </p>
          )}
        </div>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign up'}
        </button>

        {serverMessage && (
          <p className={`${styles.serverMessage} ${serverError ? styles.serverMessageError : ''}`} role={serverError ? "alert" : "status"}>
            {serverMessage}
          </p>
        )}
      </form>
      <p className={styles.loginText}>
  Already have an account?{' '}
  <a className={styles.loginLink} href="/login">
    Log in
  </a>
</p>
    </main>
  )
}