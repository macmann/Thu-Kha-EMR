import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          to="/register"
          className="flex aspect-square flex-col items-center justify-center rounded-lg bg-white p-8 shadow hover:bg-gray-50"
        >
          <div className="mb-4 text-5xl">📝</div>
          <span className="text-xl font-medium text-gray-700">Register Patient</span>
        </Link>
        <Link
          to="/patients"
          className="flex aspect-square flex-col items-center justify-center rounded-lg bg-white p-8 shadow hover:bg-gray-50"
        >
          <div className="mb-4 text-5xl">🔍</div>
          <span className="text-xl font-medium text-gray-700">Search Patient</span>
        </Link>
      </div>
    </div>
  );
}
