// src/pages/Calendar.jsx

import { useState, useEffect, useContext } from 'react';
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

  // Fetch events associated with the user's club memberships
  const fetchEvents = async () => {
    if (!user || !user.clubMemberships || user.clubMemberships.length === 0) {
      setEvents([]);
      setCalendarLoading(false);
      return;
    }

    try {
      const clubIds = user.clubMemberships.map((membership) => membership.clubId).join(',');
      const response = await authenticatedFetch(`http://localhost:5051/api/events`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Filter events to include only those from the user's clubs
        const filteredEvents = data.filter((event) => clubIds.includes(event.clubId.toString()));
        setEvents(filteredEvents);
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

  // Fetch events when the component mounts or when the user/currentDate changes
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentDate]);

  // Navigate to the previous month
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to the next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Determine the first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Get the total number of days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }

  // Populate the array with day numbers
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
      {/* Header with month and year navigation */}
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

      {/* Display the days of the week */}
      <div className="grid grid-cols-7 gap-2 text-center font-bold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid displaying each day and its events */}
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-24"></div>;
          }

          // Filter events that occur on the current day
          const dayEvents = events.filter((event) => {
            const eventDate = new Date(event.dateTime);
            return (
              eventDate.getFullYear() === year &&
              eventDate.getMonth() === month &&
              eventDate.getDate() === day
            );
          });

          // Check if the day is today
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

      {/* Modal to display event details when an event is selected */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default Calendar;
