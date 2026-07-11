'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import client from '@/lib/apolloClient';
import { GET_USER_DASHBOARD } from '@/graphql/users';

// Integrate subgraph-accounts: fetch comprehensive dashboard data

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setLoading(true);
          const result = await client.query({
            query: GET_USER_DASHBOARD,
            variables: { userId: session.user.id }
          });

          if (result.data?.userDashboard) {
            setDashboardData(result.data.userDashboard);
          } else {
            setError('Dashboard data not found');
          }
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
          setError('Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [session, status]);

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (status === 'unauthenticated') {
    redirect('/login');
    return null;
  }

  // Get user picture from dashboard data or session
  const userPicture = dashboardData?.user?.avatar || session?.user?.image;
  
  // Function to get avatar display
  const getAvatarDisplay = (size = 32) => {
    if (userPicture && userPicture.startsWith('http')) {
      return (
        <Image
          src={userPicture}
          alt="User Avatar"
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      );
    } else {
      // Fallback to icon with user's initial
      const initial = session?.user?.name?.charAt(0)?.toUpperCase() || 'U';
      return (
        <div className={`bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold`} style={{ width: size, height: size }}>
          {initial}
        </div>
      );
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation Menu */}
      <nav className="bg-blue-100 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-blue-600">🏠 Minshuku</a>
              <div className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">🏠 Home</a>
                <a href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">🔍 Search</a>
                <a href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">📋 Listings</a>
                <a href="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">📅 Bookings</a>
                <a href="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">👤 Profile</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getAvatarDisplay(32)}
                <span className="text-sm font-medium text-gray-700">{session?.user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {userPicture && userPicture.startsWith('http') ? (
                  <Image
                    src={userPicture}
                    alt="User Avatar"
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-blue-100 object-cover"
                    priority
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-500 text-white rounded-full border-4 border-blue-100 flex items-center justify-center text-2xl font-bold">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {session?.user?.name || 'User'}!
                </h1>
                <p className="text-gray-600">{session?.user?.email}</p>
                <p className="text-sm text-blue-600 font-medium">
                  {dashboardData?.user?.role || 'GUEST'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.totalListings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.totalBookings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">User Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {dashboardData?.user?.status?.toLowerCase() || 'active'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Account Type</p>
                  <p className="text-lg font-bold text-gray-900">
                    {dashboardData?.user?.role === 'HOST' ? 'Host' : 'Guest'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">📅 Recent Bookings</h3>
                <a 
                  href="/bookings" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </a>
              </div>
              <div className="p-6">
                {dashboardData?.recentBookings?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-lg">📅</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{booking.listingTitle}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status || 'PENDING'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">¥{booking.totalPrice}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-500 mb-4">No recent bookings found</p>
                    <a 
                      href="/search" 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Start exploring listings →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🏠 Recent Listings</h3>
              </div>
              <div className="p-6">
                {dashboardData?.recentListings?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentListings.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                        {listing.imageUrl && (
                          <img 
                            src={listing.imageUrl} 
                            alt={listing.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{listing.title}</p>
                          <p className="text-sm text-gray-600">¥{listing.price} per night</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No listings found</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <a 
                href="/create-listing" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-center transition-colors"
              >
                ➕ Create New Listing
              </a>
              <a 
                href="/listings" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-center transition-colors"
              >
                📋 Browse Listings
              </a>
              <a 
                href="/search" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md text-center transition-colors"
              >
                🔍 Search Listings
              </a>
              {dashboardData?.user?.role !== 'HOST' && (
                <a 
                  become-host
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                >
                  🏠 Become a Host
                </a>
              )}
              {dashboardData?.user?.role === 'HOST' && (
                <a 
                  href="/host/listings" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                >
                  🏠 Manage Listings
                </a>
              )}
            </div>
          </div>

          {/* Booking Management Section */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">📅 Booking Management</h3>
                <a 
                  href="/bookings" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All Bookings →
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData?.totalBookings || 0}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardData?.upcomingBookings || 0}</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{dashboardData?.pendingBookings || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">¥{dashboardData?.totalRevenue || 0}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
              
              {/* Quick Booking Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/search" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                >
                  🔍 Search Listings
                </a>
                <a 
                  href="/bookings" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                >
                  📅 My Bookings
                </a>
                {dashboardData?.user?.role === 'HOST' && (
                  <a 
                    href="/host/bookings" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                  >
                    🏠 Host Bookings
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Host Management Section */}
          {dashboardData?.user?.role === 'HOST' && (
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">🏠 Host Dashboard</h3>
                  <a 
                    href="/host/dashboard" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Full Dashboard →
                  </a>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData?.activeListings || 0}</div>
                    <div className="text-sm text-gray-600">Active Listings</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dashboardData?.hostPendingBookings || 0}</div>
                    <div className="text-sm text-gray-600">Pending Bookings</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">¥{dashboardData?.monthlyRevenue || 0}</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                </div>
                
                {/* Quick Host Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a 
                    href="/create-listing" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                  >
                    ➕ Add Listing
                  </a>
                  <a 
                    href="/host/listings" 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                  >
                    🏠 Manage Listings
                  </a>
                  <a 
                    href="/host/bookings" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-center transition-colors"
                  >
                    📅 Manage Bookings
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
