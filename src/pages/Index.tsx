import React, { useState, useEffect } from "react";
import ServiceCategories from "../components/ServiceCategories";
import BookingFlow from "../components/BookingFlow";
import EnhancedBookingHistory from "../components/EnhancedBookingHistory";
import Reviews from "../components/Reviews";
import JoinAsPro from "./JoinAsPro.tsx";
import AccountMenu from "../components/AccountMenu"; // Can be removed if unused
import SimplePhoneAuthModal from "../components/SimplePhoneAuthModal";
import { ArrowLeft, MapPin, UserCircle } from "lucide-react";
import {
  getCurrentUser,
  isLoggedIn as checkIsLoggedIn,
  clearAuthData,
} from "../integrations/mongodb/client";

const Index = () => {
  const [currentView, setCurrentView] = useState("categories");
  const [selectedService, setSelectedService] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [isMultipleServices, setIsMultipleServices] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // MongoDB Auth session
  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuthState = () => {
      const hasToken = checkIsLoggedIn();

      if (hasToken) {
        const user = getCurrentUser();

        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    };

    checkAuthState();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Location + cart listener
  useEffect(() => {
    getUserLocation();

    const handleCartBooking = () => {
      const cart = JSON.parse(localStorage.getItem("service_cart") || "[]");
      if (cart.length > 0) {
        handleMultipleServicesSelect(cart);
      }
    };

    window.addEventListener("bookCartServices", handleCartBooking);
    return () =>
      window.removeEventListener("bookCartServices", handleCartBooking);
  }, []);

  // Real location detection
  const getUserLocation = async () => {
    // Set loading state initially
    setCurrentLocation("Detecting location...");

    if (!navigator.geolocation) {
      setCurrentLocation("Location not available");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setLocationCoordinates({ lat: latitude, lng: longitude });

          // Try backend geocoding first
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://auth-back-ula7.onrender.com/api";
          try {
            const backendResponse = await fetch(`${API_BASE_URL}/location/geocode`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lng: longitude })
            });

            if (backendResponse.ok) {
              const data = await backendResponse.json();
              setCurrentLocation(data.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              return;
            }
          } catch (backendError) {
            console.log("Backend geocoding failed, trying fallback:", backendError);
          }

          // Fallback to OpenStreetMap if backend fails
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );

            if (response.ok) {
              const data = await response.json();
              let address = "";

              if (data.address) {
                const parts = [];
                if (data.address.road) parts.push(data.address.road);
                if (data.address.suburb || data.address.neighbourhood)
                  parts.push(data.address.suburb || data.address.neighbourhood);
                if (data.address.city || data.address.town || data.address.village)
                  parts.push(data.address.city || data.address.town || data.address.village);
                if (data.address.state) parts.push(data.address.state);
                address = parts.join(", ");
              }

              setCurrentLocation(address || data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } else {
              setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (nominatimError) {
            console.log("Nominatim geocoding failed:", nominatimError);
            setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          console.log("Location processing failed:", err);
          setCurrentLocation("Location detection failed");
        }
      },
      (err) => {
        console.log("Geolocation permission denied or failed:", err);
        setCurrentLocation("Location access denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  const navigateBack = () => {
    if (["booking", "reviews", "history", "joinAsPro"].includes(currentView)) {
      setCurrentView("categories");
    }
  };

  const handleServiceSelect = (service) => {
    if (Array.isArray(service)) {
      setSelectedServices(service);
      setIsMultipleServices(true);
      setCurrentView("booking");
    } else {
      setSelectedService(service.name);
      setSelectedProvider(service);
      setIsMultipleServices(false);
      setCurrentView("booking");
    }
  };

  const handleMultipleServicesSelect = (services) => {
    setSelectedServices(services);
    setIsMultipleServices(true);
    setCurrentView("booking");
  };

  const handleBookingComplete = () => {
    setCurrentView("categories");
    setSelectedService("");
    setSelectedServices([]);
    setSelectedProvider(null);
    setIsMultipleServices(false);
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowAuthModal(false);

    // Force re-render by triggering auth state check
    setTimeout(() => {
      const hasToken = checkIsLoggedIn();
      const storedUser = getCurrentUser();

      if (hasToken && storedUser) {
        setCurrentUser(storedUser);
        setIsLoggedIn(true);
      }
    }, 100);
  };

  const handleLogout = () => {
    clearAuthData();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView("categories");
    setShowDropdown(false);
  };

  // Auto-close dropdown on outside click
  useEffect(() => {
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {currentView === "categories" && (
          <ServiceCategories
            onServiceSelect={handleServiceSelect}
            onMultipleServicesSelect={handleMultipleServicesSelect}
          />
        )}
        {currentView === "booking" && (
          <BookingFlow
            provider={selectedProvider}
            services={selectedServices}
            isMultipleServices={isMultipleServices}
            currentUser={currentUser}
            userLocation={currentLocation}
            locationCoordinates={locationCoordinates}
            onBookingComplete={handleBookingComplete}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {currentView === "history" && (
          <EnhancedBookingHistory currentUser={currentUser} />
        )}
        {currentView === "reviews" && <Reviews provider={selectedProvider} />}
        {currentView === "joinAsPro" && (
          <JoinAsPro
            onBack={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        )}
      </main>

      {/* Auth Modal */}
      <SimplePhoneAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Index;