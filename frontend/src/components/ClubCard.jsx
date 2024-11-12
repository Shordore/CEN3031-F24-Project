// src/components/ClubCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function ClubCard({ club }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // TODO: add pages for clubs
    // navigate(`/clubs/${club.Id}`);
  };

  return (
    <div
      className="card w-full border border-white bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow duration-300"
      onClick={handleClick}
    >
      <div className="card-body">
        <h2 className="card-title">{club.name}</h2>
        <p>{club.description}</p>
        <div className="mt-2">
          <span className="font-semibold">Categories:</span>{' '}
          {club.categories}
        </div>
        <div className="mt-2">
          <span className="font-semibold">Members:</span> {club.members.length}
        </div>
      </div>
    </div>
  );
}

export default ClubCard;
