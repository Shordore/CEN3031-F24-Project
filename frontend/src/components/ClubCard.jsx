// src/components/ClubCard.jsx
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ClubCard({ club }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/club_pages/${club.id}`); // Navigate to the club page using the correct route
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

ClubCard.propTypes = {
  club: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    categories: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
};

export default ClubCard;