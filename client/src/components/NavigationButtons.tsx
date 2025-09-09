import { useNavigate } from 'react-router-dom';

export default function NavigationButtons() {
  const navigate = useNavigate();
  return (
    <div className="mt-4 flex justify-between">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
      >
        Back
      </button>
      <button
        type="button"
        onClick={() => navigate(1)}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  );
}

