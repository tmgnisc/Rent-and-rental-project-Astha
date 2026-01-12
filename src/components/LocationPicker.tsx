import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address: string) => void;
  defaultLatitude?: number;
  defaultLongitude?: number;
}

// Component to handle map clicks
function LocationMarker({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationPicker = ({ onLocationSelect, defaultLatitude, defaultLongitude }: LocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    defaultLatitude && defaultLongitude
      ? { lat: defaultLatitude, lng: defaultLongitude, address: 'Selected Location' }
      : null
  );

  useEffect(() => {
    if (location) {
      onLocationSelect(location.lat, location.lng, location.address);
    }
  }, [location, onLocationSelect]);

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error fetching address:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const address = await getAddressFromCoordinates(lat, lng);

        setLocation({ lat, lng, address });
        toast.success('Location detected successfully!');
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setLoading(true);
    const address = await getAddressFromCoordinates(lat, lng);
    setLocation({ lat, lng, address });
    toast.success('Location selected on map!');
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Use Current Location
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowMap(!showMap)}
          className="flex-1"
        >
          <MapIcon className="mr-2 h-4 w-4" />
          {showMap ? 'Hide Map' : 'Select on Map'}
        </Button>
      </div>

      {showMap && (
        <div className="border rounded-lg overflow-hidden">
          <MapContainer
            center={location ? [location.lat, location.lng] : [27.7172, 85.324]} // Default to Kathmandu, Nepal
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onLocationChange={handleMapLocationSelect} />
            {location && <Marker position={[location.lat, location.lng]} />}
          </MapContainer>
          <div className="p-2 bg-muted text-xs text-muted-foreground text-center">
            Click anywhere on the map to select your location
          </div>
        </div>
      )}

      {location && (
        <div className="text-sm p-3 bg-muted rounded-lg">
          <p className="font-medium mb-1">Selected Location:</p>
          <p className="text-muted-foreground">{location.address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

