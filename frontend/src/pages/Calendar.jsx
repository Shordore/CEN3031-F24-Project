// src/pages/Calendar.jsx
import React, { useState, useEffect, useContext } from 'react';
import EventModal from '../components/EventModal';
import { UserContext } from '../context/UserContext';
import { authenticatedFetch } from '../utils/api';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState('');
  const { user } = useContext(UserContext);

  const fetchEvents = async () => {
    if (!user || user.clubMemberships.length === 0) {
      setEvents([]);
      setCalendarLoading(false);
      return;
    }

    try {
      const clubIds = user.clubMemberships.map((membership) => membership.clubId).join(',');
      const response = await authenticatedFetch(
        `http://localhost:5051/api/events`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const data = await response.json();
        const events = data.filter((event) => clubIds.includes(event.clubId));

        setEvents(events);
      } else {
        const errorData = await response.text();
        setCalendarError(errorData || 'Failed to fetch events.');
      }
    } catch (err) {
      console.error(err);
      setCalendarError('An unexpected error occurred while fetching events.');
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentDate]);

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const today = new Date();

  if (calendarLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  if (calendarError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M12 4v16m8-8H4"
              />
            </svg>
            <span>{calendarError}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 py-12">
      {/* Header with month and year */}
      <div className="flex justify-between items-center mb-4">
        <button className="btn" onClick={prevMonth}>
          &lt;
        </button>
        <h2 className="text-xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <button className="btn" onClick={nextMonth}>
          &gt;
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 text-center font-bold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-24"></div>;
          }

          const dayEvents = events.filter((event) => {
            const eventDate = new Date(event.dateTime);
            return (
              eventDate.getFullYear() === year &&
              eventDate.getMonth() === month &&
              eventDate.getDate() === day
            );
          });

          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <div
              key={index}
              className={`border rounded h-24 p-1 ${
                isToday ? 'border-2 border-blue-500' : 'border-gray-300'
              }`}
            >
              <div className="text-sm font-bold">{day}</div>
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  className="block mt-1 text-xs text-blue-600 font-medium hover:underline"
                  onClick={() => setSelectedEvent(event)}
                >
                  {event.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Event details modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default Calendar;
