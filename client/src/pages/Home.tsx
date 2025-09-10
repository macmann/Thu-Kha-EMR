import { Link } from 'react-router-dom';

function RegisterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11.25c2.071 0 3.75-1.679 3.75-3.75S14.071 3.75 12 3.75 8.25 5.429 8.25 7.5 9.929 11.25 12 11.25z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 20.25c0-2.485 2.514-4.5 5.25-4.5s5.25 2.015 5.25 4.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25v3m0 0v3m0-3h3m-3 0h-3" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m2.6-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-6">
        <Link
          to="/register"
          className="flex aspect-square flex-col items-center justify-center rounded-lg bg-white p-8 shadow hover:bg-gray-50"
        >
          <RegisterIcon className="mb-4 h-20 w-20 text-gray-700" />
          <span className="text-xl font-medium text-gray-700">Register Patient</span>
        </Link>
        <Link
          to="/patients"
          className="flex aspect-square flex-col items-center justify-center rounded-lg bg-white p-8 shadow hover:bg-gray-50"
        >
          <SearchIcon className="mb-4 h-20 w-20 text-gray-700" />
          <span className="text-xl font-medium text-gray-700">Search Patient</span>
        </Link>
      </div>
    </div>
  );
}

