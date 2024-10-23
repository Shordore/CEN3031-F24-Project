import React, { useState } from 'react';
import EventModal from '../components/EventModal';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // sample data for now
  const events = [
    {
      date: '2024-10-05',
      title: 'Chess Club Meeting',
      club: 'Chess Club',
      location: 'Room 101',
      time: '3:00 PM',
    },
    {
      date: '2024-10-24',
      title: 'Science Fair',
      club: 'Science Club',
      location: 'Auditorium',
      time: '1:00 PM',
    },
  ];

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

          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2,'0')}`;
          const dayEvents = events.filter((event) => event.date === dateString);

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
                  key={event.title}
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
