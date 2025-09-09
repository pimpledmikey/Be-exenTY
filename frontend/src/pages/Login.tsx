import React, { useState } from 'react';
import styles from './Login.module.css';
import Swal from 'sweetalert2';
import logoBeExEn from '../assets/logoBeExEn.png';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } else {
      Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire('Registro exitoso', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.', 'success');
    setIsRegister(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className={`${styles['login-container']} fade-in`}>
      <div className={styles['image-box']}>
        <div className={styles['logo-glass-container']}>
          <img src={logoBeExEn} alt="Logo BE Excellent Energy" className={styles['logo-glass']} />
        </div>
        <h1>Tu inventario seguro</h1>
        <p>Controla tu almacén y usuarios con seguridad y facilidad.</p>
      </div>
      <div className={styles['form-box']}>
        <h2 style={{ textAlign: 'center' }}>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <input
            className={styles['input']}
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            style={{ marginBottom: 16 }}
          />
          {isRegister && (
            <input
              className={styles['input']}
              type="email"
              placeholder="Email (opcional)"
              style={{ marginBottom: 16 }}
            />
          )}
          <input
            className={styles['input']}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ marginBottom: isRegister ? 16 : 24 }}
          />
          {isRegister && (
            <input
              className={styles['input']}
              type="password"
              placeholder="Confirmar contraseña"
              required
              autoComplete="new-password"
              style={{ marginBottom: 24 }}
            />
          )}
          <button className={styles['button']} type="submit" disabled={loading}>
            {isRegister ? 'Registrar' : loading ? 'Entrando...' : 'Login'}
          </button>
        </form>
        <div className={styles['switch']}>
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?
              <a href="#" onClick={() => setIsRegister(false)}>Inicia sesión</a>
            </>
          ) : (
            <>
              ¿No tienes cuenta?
              <a href="#" onClick={() => setIsRegister(true)}>Regístrate</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
