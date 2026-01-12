import { lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Map = lazy(() => import('@/components/Map'));

interface Rental {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  startDate: string;
  endDate: string;
  deliveryAddress: string;
  contactPhone: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryLocationAddress?: string;
  status: string;
}

interface RentalMapViewProps {
  rental: Rental;
}

const RentalMapView = ({ rental }: RentalMapViewProps) => {
  const hasLocation = rental.deliveryLatitude && rental.deliveryLongitude;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Delivery Location
          </CardTitle>
          <CardDescription>Customer location and rental details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Info */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customer:</span>
                  <span className="text-sm">{rental.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">{rental.customerEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone:
                  </span>
                  <a href={`tel:${rental.contactPhone}`} className="text-sm text-primary hover:underline">
                    {rental.contactPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Rental Period:
                  </span>
                  <span className="text-sm">
                    {format(new Date(rental.startDate), 'MMM dd')} - {format(new Date(rental.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="outline" className="capitalize">
                    {rental.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Delivery Address:</p>
            <p className="text-sm text-muted-foreground">{rental.deliveryAddress}</p>
          </div>

          {/* Map */}
          {hasLocation ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Location on Map:</p>
              <Suspense
                fallback={
                  <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <Map
                  latitude={rental.deliveryLatitude!}
                  longitude={rental.deliveryLongitude!}
                  label={`${rental.customerName} - ${rental.productName}`}
                  height="300px"
                  zoom={15}
                />
              </Suspense>
              {rental.deliveryLocationAddress && (
                <p className="text-xs text-muted-foreground mt-2">
                  📍 {rental.deliveryLocationAddress}
                </p>
              )}
              <div className="mt-3">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${rental.deliveryLatitude},${rental.deliveryLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" />
                  Get Directions on Google Maps
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Customer did not share their location
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalMapView;

