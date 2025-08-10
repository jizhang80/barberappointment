import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Barber Appointment Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Book appointments with your favorite barber shops or manage your barber business online
        </p>
        
        <div className="flex gap-6 items-center justify-center flex-col sm:flex-row">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full sm:w-auto"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Customers</h3>
            <p className="text-gray-600">
              Find and book appointments with local barber shops. View available time slots, 
              services, and pricing all in one place.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Barbers</h3>
            <p className="text-gray-600">
              Manage your shop, services, and appointments online. Set your schedule, 
              track bookings, and grow your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
