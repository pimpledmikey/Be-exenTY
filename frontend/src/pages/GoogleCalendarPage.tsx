import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es as esES } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'es': esES,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  location?: string;
};

const GoogleCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Login handler
  const login = useGoogleLogin({
    onSuccess: (tokenResponse: any) => setToken(tokenResponse.access_token),
    onError: () => alert('Error al iniciar sesión con Google'),
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    flow: 'implicit',
  });

  // Fetch events from Google Calendar
  useEffect(() => {
    if (!token) return;
    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&singleEvents=true&orderBy=startTime', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.items) return;
        const mappedEvents = data.items.map((item: any) => ({
          id: item.id,
          title: item.summary || '(Sin título)',
          start: item.start.dateTime ? new Date(item.start.dateTime) : new Date(item.start.date),
          end: item.end.dateTime ? new Date(item.end.dateTime) : new Date(item.end.date),
          allDay: !item.start.dateTime,
          description: item.description || '',
          location: item.location || '',
        }));
        setEvents(mappedEvents);
      });
  }, [token]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Calendario de Google</h2>
      {!token ? (
        <button
          onClick={() => login()}
          style={{
            background: '#4285F4',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            fontWeight: 600,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 2px 8px rgba(66,133,244,0.15)',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7.5-11.3 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2 0.9 7.2 2.5l6-6C36.1 5.1 30.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.4-0.1-2.7-0.4-3.5z"/>
              <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.7 0 5.2 0.9 7.2 2.5l6-6C36.1 5.1 30.4 3 24 3 16.1 3 9.1 7.6 6.3 14.7z"/>
              <path fill="#FBBC05" d="M24 45c6.2 0 11.4-2 15.2-5.5l-7-5.7C29.7 35.5 27 36.5 24 36.5c-5.6 0-10.3-3.8-12-9H6.3C8.9 40.4 15.8 45 24 45z"/>
              <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-0.7 2-2.1 3.7-3.9 4.9l7 5.7C41.9 41.1 45 33.7 45 24c0-1.4-0.1-2.7-0.4-3.5z"/>
            </g>
          </svg>
          Iniciar sesión con Google
        </button>
      ) : (
        <>
          <button onClick={() => { googleLogout(); setToken(null); }}>Cerrar sesión</button>
          <div style={{ height: 600, marginTop: 24 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              messages={{
                next: 'Sig.',
                previous: 'Ant.',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay eventos en este rango.',
              }}
              onSelectEvent={(event) => setSelectedEvent(event)}
            />
          </div>
          {/* Modal de detalles del evento */}
          {selectedEvent && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
              onClick={() => setSelectedEvent(null)}
            >
              <div style={{
                background: '#fff',
                borderRadius: 10,
                padding: 32,
                minWidth: 320,
                maxWidth: 400,
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                position: 'relative',
              }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{marginTop:0}}>{selectedEvent.title}</h3>
                <p><b>Inicio:</b> {selectedEvent.start.toLocaleString()}</p>
                <p><b>Fin:</b> {selectedEvent.end.toLocaleString()}</p>
                {selectedEvent.location && <p><b>Ubicación:</b> {selectedEvent.location}</p>}
                {selectedEvent.description && <p><b>Descripción:</b> {selectedEvent.description}</p>}
                <button onClick={() => setSelectedEvent(null)} style={{marginTop:16, background:'#4285F4', color:'#fff', border:'none', borderRadius:6, padding:'8px 16px', fontWeight:600, cursor:'pointer'}}>Cerrar</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleCalendarPage;
